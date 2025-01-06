package com.deepen.entity;


import com.deepen.domain.CommonDetailDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COMMON_DETAIL")
@Data
@NoArgsConstructor
public class CommonDetail {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="common_detail_code", length = 50, nullable = false, unique = true)
	private String common_detail_code;
	
	@Column(name="common_detail_name", length = 50, nullable = false)
	private String common_detail_name;
	
	@Column(name="common_detail_status", length = 1)
	private String common_detail_status = "Y";
	
	@Column(name="common_detail_display")
	private int common_detail_display;
	
//	// 양방향 매핑: SalaryFormula
//	@OneToMany(mappedBy = "commonDetail")
//    private List<SalaryFormula> salaryFormulas = new ArrayList<>();
	
	// DTO -> Entity 변환을 위한 정적 메서드
	public static CommonDetail setCommonDetailEntity(CommonDetailDTO commonDetailDTO) {
        CommonDetail commonDetail = new CommonDetail();
        commonDetail.setCommon_detail_code(commonDetailDTO.getCommon_detail_code());
        commonDetail.setCommon_detail_name(commonDetailDTO.getCommon_detail_name());
        commonDetail.setCommon_detail_status(commonDetailDTO.getCommon_detail_status());
        commonDetail.setCommon_detail_display(commonDetailDTO.getCommon_detail_display());
        return commonDetail;
    }
	

}
