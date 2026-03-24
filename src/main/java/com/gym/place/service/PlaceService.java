package com.gym.place.service;

/**
 * 地点服务接口
 * 定义将经纬度转换为地点名称的方法
 */
public interface PlaceService {
    
    /**
     * 根据经纬度获取地点名称
     * @param longitude 经度
     * @param latitude 纬度
     * @return 地点名称
     */
    String getPlaceNameByCoordinates(double longitude, double latitude);
}
