package com.bezkoder.springjwt.models;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
public class LeaveRequest {
    private String message;
    private String startDate;
    private String endDate;
    private String justificationPath;

    private String typeConger ;
}

