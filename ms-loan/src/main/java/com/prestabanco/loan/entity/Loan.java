package com.prestabanco.loan.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int selectedYears;
    private int selectedLoan; // 1 its firstHome 2 its SecondHome 3 CommercialProperties 4 Remodeling
    private Double selectedInterest;
    private Double propertyValue;

    private Long userId;

    private byte[] incomeDocument;
    private byte[] appraisalCertificate;
    private byte[] businessFinancialState;
    private byte[] businessPlan;
    private byte[] firstHomeDeed;
    private byte[] historicalCredit;
    private byte[] remodelingBudget;

}