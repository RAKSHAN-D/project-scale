package com.projectscale.projectscale.dto;
import java.time.OffsetDateTime;
import java.util.Map;
public class ColdItemResponse {
    private Long id;
    private Map<String, Object> data;
    private String type;
    private Long userId;
    private OffsetDateTime createdAt;
    public Long getId() {
        return id;
    }
    public Map<String, Object> getData() {
        return data;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setData(Map<String, Object> data) {
        this.data = data;
    }
    public String getType() {
        return type;
    }
    public void setType(String type){
        this.type = type;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}



