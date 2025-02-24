package com.deepen.service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import com.deepen.entity.Holiday;
import com.deepen.repository.HolidayRepository;

import jakarta.transaction.Transactional;

@Service
public class HolidayService {
	
	@Value("${holiday_api_key}")
    private String service_key;
	
	@Value("${holiday_api_url}")
    private String base_url;
	
    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }
    
    /**
     * API에서 공휴일 데이터를 가져와 DB에 저장
     */
    
    @Transactional
    public void fetchAndSaveHolidays(int year, int month) {
        List<Holiday> holidays = fetchHolidaysAPI(year, month);
        holidayRepository.saveAll(holidays);
    }    

    /**
     * 공공데이터포털 API 호출하여 공휴일 데이터 가져오기
     */
    public List<Holiday> fetchHolidaysAPI(int year, int month) {
        List<Holiday> holidayList = new ArrayList<>();
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(base_url)
                    .queryParam("ServiceKey", service_key)
                    .queryParam("solYear", year)
                    .queryParam("solMonth", String.format("%02d", month))
                    .queryParam("_type", "xml") // XML 포맷 사용
                    .build()
                    .toUri();

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(uri, String.class);

            // XML 파싱
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new java.io.ByteArrayInputStream(response.getBytes()));

            NodeList itemList = document.getElementsByTagName("item");

            for (int i = 0; i < itemList.getLength(); i++) {
                String date_name = document.getElementsByTagName("dateName").item(i).getTextContent();
                String locdate = document.getElementsByTagName("locdate").item(i).getTextContent();
                
                // YYYYMMDD → YYYY-MM-DD 변환
                String formattedDate = locdate.substring(0, 4) + "-" + locdate.substring(4, 6) + "-" + locdate.substring(6, 8);

                holidayList.add(new Holiday(date_name, formattedDate, year, month));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return holidayList;
    }
}
