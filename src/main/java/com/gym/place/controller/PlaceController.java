package com.gym.place.controller;

import com.gym.place.exception.InvalidCoordinatesException;
import com.gym.place.service.PlaceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 地点控制器
 * 提供根据经纬度获取地点名称的API接口
 */
@RestController
@RequestMapping("/api")
public class PlaceController {
    
    private final PlaceService placeService;
    
    /**
     * 构造函数，注入地点服务
     * @param placeService 地点服务实例
     */
    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }
    
    /**
     * 根据经纬度获取地点名称
     * @param lon 经度
     * @param lat 纬度
     * @return 包含地点名称的JSON响应
     */
    @GetMapping("/place")
    public Map<String, String> getPlaceName(
            @RequestParam(name = "lon", required = true) double lon,
            @RequestParam(name = "lat", required = true) double lat) {
        
        // 验证经纬度范围
        validateCoordinates(lon, lat);
        
        // 调用服务获取地点名称
        String placeName = placeService.getPlaceNameByCoordinates(lon, lat);
        
        // 构造返回结果
        Map<String, String> result = new HashMap<>();
        result.put("placeName", placeName);
        
        return result;
    }
    
    /**
     * 验证经纬度是否在合理范围内
     * @param longitude 经度（-180到180）
     * @param latitude 纬度（-90到90）
     * @throws InvalidCoordinatesException 当经纬度超出范围时抛出异常
     */
    private void validateCoordinates(double longitude, double latitude) {
        if (longitude < -180 || longitude > 180) {
            throw new InvalidCoordinatesException("经度必须在-180到180之间");
        }
        if (latitude < -90 || latitude > 90) {
            throw new InvalidCoordinatesException("纬度必须在-90到90之间");
        }
    }
}

