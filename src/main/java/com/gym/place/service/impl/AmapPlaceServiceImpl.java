package com.gym.place.service.impl;

import com.gym.place.service.PlaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 高德地图地点服务实现类
 * 核心功能：调用高德地图Web服务API完成「逆地理编码」（经纬度→具体地址）
 * 依赖：高德Web服务API Key、逆地理编码API地址配置
 * 技术选型：WebClient（非阻塞HTTP客户端，适配Spring WebFlux）
 *
 * @author 开发者名称
 * @date 2025-12-23
 */
@Service
public class AmapPlaceServiceImpl implements PlaceService {

    // 日志组件（SLF4J）
    private static final Logger logger = LoggerFactory.getLogger(AmapPlaceServiceImpl.class);

    // 高德API核心配置（构造器注入，不可变）
    private final String amapKey;
    private final String regeoApiPath;
    // HTTP客户端（全局复用，线程安全）
    private final WebClient webClient;

    /**
     * 构造函数：注入配置 + 初始化WebClient
     * 优点：构造器注入保证依赖不可变，符合Spring最佳实践；提前校验配置有效性
     *
     * @param amapKey        高德地图API密钥（从配置文件注入）
     * @param regeoApiPath   逆地理编码API路径（如：/v3/geocode/regeo）
     */
    public AmapPlaceServiceImpl(
            @Value("${amap.key}") String amapKey,
            @Value("${amap.regeo-url-template}") String regeoApiPath) {
        // 1. 赋值核心配置
        this.amapKey = amapKey;
        this.regeoApiPath = regeoApiPath;

        // 2. 校验API Key有效性（提前暴露配置问题）
        validateAmapKey();

        // 3. 初始化WebClient（全局单例，复用连接池）
        this.webClient = initWebClient();
    }

    /**
     * 校验高德API Key有效性
     * 场景：避免因Key未配置/使用默认值导致API调用失败
     */
    private void validateAmapKey() {
        if (amapKey == null || amapKey.trim().isEmpty()) {
            logger.error("【高德API配置异常】高德地图API密钥未配置！请检查application.yml中的amap.key");
            throw new IllegalArgumentException("高德地图API密钥不能为空");
        }
        // 仅检查明显的占位符字符串
        if ("YOUR_AMAP_API_KEY".equals(amapKey)) {
            logger.warn("【高德API配置警告】使用默认/占位符API密钥，API调用将失败！请替换为有效Key");
        }
    }

    /**
     * 初始化WebClient客户端
     * 配置：基础URL、超时、内存限制、编码等
     *
     * @return 配置完成的WebClient实例
     */
    private WebClient initWebClient() {
        return WebClient.builder()
                // 高德Web服务API基础域名（固定）
                .baseUrl("https://restapi.amap.com")
                // 调整内存限制：解决大响应体解析失败问题（默认256KB，此处提升至16MB）
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                // 连接超时配置（可扩展：此处简化，如需精细控制可结合ClientHttpConnector）
                .build();
    }

    /**
     * 核心业务方法：根据经纬度获取格式化地址
     * 逻辑流程：参数校验 → API调用 → 响应解析 → 异常处理
     * 注意：未找到地址时不再返回兜底地址，而是返回固定错误消息"请求地址失败"
     * 
     * @param longitude 经度（范围：73.404~135.085）
     * @param latitude  纬度（范围：3.86~53.55）
     * @return 格式化地址（如：北京市东城区东华门街道南河沿大街69号）；未找到地址或异常时返回"请求地址失败"
     */
    @Override
    public String getPlaceNameByCoordinates(double longitude, double latitude) {
        // 1. 前置：校验经纬度合法性（避免无效调用）
        if (!isValidCoordinates(longitude, latitude)) {
            logger.warn("【经纬度校验失败】经纬度不合法，经度：{}，纬度：{}", longitude, latitude);
            return "请求地址失败";
        }

        try {
            logger.debug("【调用高德逆地理编码API】开始，经纬度：{},{}", longitude, latitude);

            // 2. 调用高德API（非阻塞→阻塞，适配同步场景）
            Map<String, Object> apiResponse = callAmapRegeoApi(longitude, latitude);

            // 3. 解析API响应
            String formattedAddress = parseRegeoResponse(apiResponse);

            // 4. 结果校验：返回有效地址或错误消息
            if (formattedAddress != null && !formattedAddress.trim().isEmpty()) {
                logger.debug("【地址解析成功】经纬度{},{} → 地址：{}", longitude, latitude, formattedAddress);
                return formattedAddress;
            } else {
                logger.warn("【地址解析失败】经纬度{},{}未解析到有效地址", longitude, latitude);
                return "请求地址失败";
            }

        } catch (WebClientResponseException e) {
            // 针对性处理：HTTP状态码异常（如403/500）
            logger.error("【高德API调用异常】HTTP状态码：{}，响应体：{}，经纬度：{},{}",
                    e.getStatusCode(), e.getResponseBodyAsString(), longitude, latitude, e);
            return "请求地址失败";
        } catch (WebClientException e) {
            // 网络异常：连接超时、DNS解析失败等
            logger.error("【高德API网络异常】调用失败，经纬度：{},{}", longitude, latitude, e);
            return "请求地址失败";
        } catch (Exception e) {
            // 兜底异常：避免业务中断
            logger.error("【地址解析未知异常】经纬度：{},{}", longitude, latitude, e);
            return "请求地址失败";
        }
    }

    /**
     * 校验经纬度合法性（中国境内范围）
     * 经度：73.404~135.085（东经）
     * 纬度：3.86~53.55（北纬）
     *
     * @param longitude 经度
     * @param latitude  纬度
     * @return true=合法，false=不合法
     */
    private boolean isValidCoordinates(double longitude, double latitude) {
        return longitude >= 73.404 && longitude <= 135.085
                && latitude >= 3.86 && latitude <= 53.55;
    }

    /**
     * 调用高德逆地理编码API
     * 封装URI拼接、参数传递、响应转换逻辑
     *
     * @param longitude 经度
     * @param latitude  纬度
     * @return 高德API原始响应（Map格式）
     */
    private Map<String, Object> callAmapRegeoApi(double longitude, double latitude) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        // API路径（如：/v3/geocode/regeo）
                        .path(regeoApiPath)
                        // 核心参数：经纬度（保留6位小数，符合高德精度要求）
                        .queryParam("location", String.format("%.6f,%.6f", longitude, latitude))
                        // 必传：API密钥
                        .queryParam("key", amapKey)
                        // 可选：返回基础地址（base）/完整地址（all）
                        .queryParam("extensions", "all")
                        // 可选：返回格式（默认JSON，无需指定）
                        .queryParam("output", "JSON")
                        .build())
                // 响应处理：非2xx状态码抛出WebClientResponseException
                .retrieve()
                // 响应转换：JSON→Map
                .bodyToMono(Map.class)
                // 同步阻塞：超时时间10秒（避免无限等待）
                .block(Duration.ofSeconds(10));
    }

    /**
     * 解析高德逆地理编码API响应
     * 核心逻辑：状态校验 → 格式化地址提取 → 地址组件拼接（兜底）
     * 注意：不再使用buildFallbackAddress方法，未找到地址时返回null
     * 
     * @param apiResponse 高德API原始响应
     * @return 格式化地址（null=解析失败）
     */
    private String parseRegeoResponse(Map<String, Object> apiResponse) {
        // 空响应校验
        if (apiResponse == null) {
            logger.warn("【API响应解析】高德API返回空响应");
            return null;
        }

        // 1. 校验API调用状态（1=成功，0=失败）
        String status = Objects.toString(apiResponse.get("status"), "0");
        if (!"1".equals(status)) {
            String errorInfo = Objects.toString(apiResponse.get("info"), "未知错误");
            String errorCode = Objects.toString(apiResponse.get("infocode"), "无错误码");
            logger.warn("【API调用失败】状态码：{}，错误信息：{}，错误码：{}", status, errorInfo, errorCode);
            return null;
        }

        // 2. 提取regeocode节点（核心地址数据）
        Map<String, Object> regeoCode = (Map<String, Object>) apiResponse.get("regeocode");
        if (regeoCode == null) {
            logger.warn("【API响应解析】regeocode节点为空");
            return null;
        }

        // 3. 优先返回格式化地址（高德推荐，最完整）
        String formattedAddress = Objects.toString(regeoCode.get("formatted_address"), null);
        if (formattedAddress != null && !formattedAddress.trim().isEmpty()) {
            return formattedAddress;
        }

        // 4. 格式化地址为空时，拼接地址组件
        return buildAddressFromComponents(regeoCode);
    }

    /**
     * 从地址组件拼接完整地址（格式化地址为空时使用）
     * 拼接规则：省 + 市 + 区 + 街道 + 门牌号
     * 兼容处理：直辖市（city字段为[]）、字段缺失等场景
     * 注意：不再返回兜底地址，拼接失败时返回null
     * 
     * @param regeoCode 高德API的regeocode节点
     * @return 拼接后的地址（null=拼接失败）
     */
    private String buildAddressFromComponents(Map<String, Object> regeoCode) {
        // 提取地址组件节点
        Map<String, Object> addressComponent = (Map<String, Object>) regeoCode.get("addressComponent");
        if (addressComponent == null) {
            logger.warn("【地址组件解析】addressComponent节点为空");
            return null;
        }

        // 构建地址拼接器
        StringBuilder addressBuilder = new StringBuilder();

        // 1. 省份（必选）
        String province = Objects.toString(addressComponent.get("province"), "");
        if (!province.isEmpty()) {
            addressBuilder.append(province);
        }

        // 2. 城市（兼容：String/List<空>，如直辖市city为[]）
        Object cityObj = addressComponent.get("city");
        String city = "";
        if (cityObj instanceof String) {
            city = (String) cityObj;
        } else if (cityObj instanceof List) {
            // 直辖市返回空列表，城市名=省份名
            city = province;
        }
        if (!city.isEmpty() && !addressBuilder.toString().endsWith(city)) {
            addressBuilder.append(city);
        }

        // 3. 区县
        String district = Objects.toString(addressComponent.get("district"), "");
        if (!district.isEmpty()) {
            addressBuilder.append(district);
        }

        // 4. 街道
        String street = Objects.toString(addressComponent.get("street"), "");
        if (!street.isEmpty()) {
            addressBuilder.append(street);
        }

        // 5. 门牌号（需先提取streetNumber节点）
        Map<String, Object> streetNumber = (Map<String, Object>) addressComponent.get("streetNumber");
        if (streetNumber != null) {
            String number = Objects.toString(streetNumber.get("number"), "");
            if (!number.isEmpty()) {
                addressBuilder.append(number);
            }
        }

        // 返回拼接结果（去空）
        String fullAddress = addressBuilder.toString().trim();
        logger.debug("【地址组件拼接】结果：{}", fullAddress);
        return fullAddress.isEmpty() ? null : fullAddress;
    }
}