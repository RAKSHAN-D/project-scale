package com.projectscale.projectscale.dto;

import java.util.List;

public record ColdDataSummaryPage(List<Row> records, int page, int size, long total) {
    public record Row(long userId, String name, String locality, String highestQualification, Integer recordedFamilyMembers) {}
}
