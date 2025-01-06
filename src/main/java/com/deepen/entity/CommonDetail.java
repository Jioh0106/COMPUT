package com.deepen.entity;


import com.deepen.domain.CommonDetailDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COMMON_DETAIL")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
public class CommonDetail {
	
	@Id
	@Column(name="common_detail_code", length = 50)
	private String common_detail_code;
	
	@Column(name="common_detail_name", length = 50, nullable = false)
	private String common_detail_name;
	
	@Column(name="common_detail_status", length = 1)
	private String common_detail_status = "Y";
	
	// DTO -> Entity 변환을 위한 정적 메서드
	public static CommonDetail setCommonDetailEntity(CommonDetailDTO commonDetailDTO) {
        CommonDetail commonDetail = new CommonDetail();
        commonDetail.setCommon_detail_code(commonDetailDTO.getCommon_detail_code());
        commonDetail.setCommon_detail_name(commonDetailDTO.getCommon_detail_name());
        commonDetail.setCommon_detail_status(commonDetailDTO.getCommon_detail_status());
        return commonDetail;
    }
	

}
