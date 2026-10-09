package com.projectscale.projectscale.dto;
import java.time.OffsetDateTime;
public class ColdItemResponse {
    private Long id;
    private String data;
    private String type;
    private Long userId;
    private OffsetDateTime createdAt;
    public Long getId() {
        return id;
    }
    public String getData() {
        return data;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setData(String data) {
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



