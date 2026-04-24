package com.projectscale.projectscale.dto;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class HotItemRequest {
    @NotBlank
    private String itemKey;
   @NotNull
    private Map<String, Object> value;

    public String getItemKey() {
        return itemKey;
    }
    public void setItemKey(String itemKey) {
        this.itemKey = itemKey;
    }
    public String getValue() {
        return value;
    }
    public void setValue(String value) {
        this.value = value;
    }
}
