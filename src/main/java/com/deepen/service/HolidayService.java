package com.deepen.service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import com.deepen.entity.Holiday;
import com.deepen.repository.HolidayRepository;

@Service
public class HolidayService {

    private static final String SERVICE_KEY = "발급받은_서비스키"; // 🔹 서비스 키 입력
    private static final String BASE_URL = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    /**
     * 공공데이터포털 API를 호출하여 특정 연/월의 공휴일 데이터를 가져오는 메서드
     */
    public List<Holiday> fetchHolidays(int year, int month) {
        List<Holiday> holidayList = new ArrayList<>();
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("ServiceKey", SERVICE_KEY)
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
                String dateName = document.getElementsByTagName("dateName").item(i).getTextContent();
                String locdate = document.getElementsByTagName("locdate").item(i).getTextContent();

                holidayList.add(new Holiday(dateName, locdate));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return holidayList;
    }

    /**
     * API에서 공휴일 데이터를 가져와 DB에 저장하는 메서드
     */
    public void saveHolidays(int year, int month) {
        List<Holiday> holidays = fetchHolidays(year, month); // 여기서 직접 호출
        holidayRepository.saveAll(holidays);
    }
}
