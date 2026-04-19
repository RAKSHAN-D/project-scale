package com.projectscale.projectscale.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
public class ColdDataRequest {
   @NotNull
    private Long userId;
    @NotBlank
    private String payload;
    @NotNull
    private ColdItemType type;
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public String getPayload() {
        return payload;
    }
    public void setPayload(String payload) {
        this.payload = payload;
    }
    public ColdItemType getType() {
        return type;
    }
    public void setType(ColdItemType type) {
        this.type = type;
    }
}