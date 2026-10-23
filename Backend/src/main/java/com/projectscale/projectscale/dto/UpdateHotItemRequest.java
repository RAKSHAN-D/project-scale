package com.projectscale.projectscale.dto;

import java.util.Map;

public class UpdateHotItemRequest {
    private String itemKey;
    private Map<String, Object> value;

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
