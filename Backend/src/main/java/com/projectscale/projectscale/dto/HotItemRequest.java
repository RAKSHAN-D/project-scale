package com.projectscale.projectscale.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class HotItemRequest {
    @NotNull
    private Long userId;
    @NotBlank
    private String itemKey;
    @NotNull
    private Map<String, Object> value;


    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
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
}
