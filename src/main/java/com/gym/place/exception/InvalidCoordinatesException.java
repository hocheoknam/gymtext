package com.gym.place.exception;

/**
 * 无效坐标异常
 * 当传入的经纬度超出有效范围时抛出此异常
 */
public class InvalidCoordinatesException extends RuntimeException {
    
    /**
     * 构造函数
     * @param message 异常消息
     */
    public InvalidCoordinatesException(String message) {
        super(message);
    }
    
    /**
     * 构造函数
     * @param message 异常消息
     * @param cause 异常原因
     */
    public InvalidCoordinatesException(String message, Throwable cause) {
        super(message, cause);
    }
}
