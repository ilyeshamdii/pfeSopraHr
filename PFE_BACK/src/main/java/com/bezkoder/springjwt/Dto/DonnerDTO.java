package com.bezkoder.springjwt.Dto;

public class DonnerDTO {
    private Long id;
    private Long congerMaladieId;
    private Long soldeCongerId;
    private long durationInDays;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCongerMaladieId() {
        return congerMaladieId;
    }

    public void setCongerMaladieId(Long congerMaladieId) {
        this.congerMaladieId = congerMaladieId;
    }

    public Long getSoldeCongerId() {
        return soldeCongerId;
    }

    public void setSoldeCongerId(Long soldeCongerId) {
        this.soldeCongerId = soldeCongerId;
    }

    public long getDurationInDays() {
        return durationInDays;
    }

    public void setDurationInDays(long durationInDays) {
        this.durationInDays = durationInDays;
    }
}
