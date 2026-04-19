package com.projectscale.projectscale.dto;  
import java.time.OffsetDateTime;
import java.util.Map;
public class HotItemResponse {
    private Long id;
    private String itemKey;
    private Map<String, Object> value;
    private OffsetDateTime updatedAt;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getItemKey() {
        return itemKey;
    }
    public void setItemKey(String itemKey) {
        this.itemKey = itemKey;
    }
    public Map<String, Object> getValue() {
        return value;
    }
    public void setValue(Map<String, Object> value) {
        this.value = value;
    }
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}