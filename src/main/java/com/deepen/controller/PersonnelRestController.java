package com.deepen.controller;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PersonnelRestController {

    @GetMapping("/test1")
    public List<Map<String, Object>> getData() {
        List<Map<String, Object>> data = new ArrayList<>();
        
        // 날짜 형식 처리
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
        
        // 테스트 데이터 생성
        Map<String, Object> row1 = new HashMap<>();
        row1.put("emp_hire_date", LocalDate.parse("2015/03/01", formatter)); 
        row1.put("emp_num", "150301001004");
        row1.put("emp_name", "김부장");
        row1.put("emp_dept", "인사팀");
        row1.put("emp_position", "부장");
        row1.put("emp_email", "test@gmail.com");
        data.add(row1);

        Map<String, Object> row2 = new HashMap<>();
        row2.put("emp_hire_date", LocalDate.parse("2015/12/09", formatter));
        row2.put("emp_num", "151209002005");
        row2.put("emp_name", "김이사");
        row2.put("emp_dept", "재무팀");
        row2.put("emp_position", "이사");
        row2.put("emp_email", "test2@gmail.com");
        data.add(row2);

        Map<String, Object> row3 = new HashMap<>();
        row3.put("emp_hire_date", LocalDate.parse("2015/12/09", formatter));
        row3.put("emp_num", "151209004004");
        row3.put("emp_name", "박부장");
        row3.put("emp_dept", "개발팀");
        row3.put("emp_position", "부장");
        row3.put("emp_email", "test3@gmail.com");
        data.add(row3);

        Map<String, Object> row4 = new HashMap<>();
        row4.put("emp_hire_date", LocalDate.parse("2017/03/09", formatter));
        row4.put("emp_num", "170309004003");
        row4.put("emp_name", "조차장");
        row4.put("emp_dept", "개발팀");
        row4.put("emp_position", "차장");
        row4.put("emp_email", "test4@gmail.com");
        data.add(row4);

        Map<String, Object> row5 = new HashMap<>();
        row5.put("emp_hire_date", LocalDate.parse("2018/07/09", formatter));
        row5.put("emp_num", "180709004005");
        row5.put("emp_name", "정팀장");
        row5.put("emp_dept", "개발팀");
        row5.put("emp_position", "팀장");
        row5.put("emp_email", "test5@gmail.com");
        data.add(row5);

        Map<String, Object> row6 = new HashMap<>();
        row6.put("emp_hire_date", LocalDate.parse("2021/03/02", formatter));
        row6.put("emp_num", "210302004006");
        row6.put("emp_name", "손대리");
        row6.put("emp_dept", "개발팀");
        row6.put("emp_position", "대리");
        row6.put("emp_email", "test6@gmail.com");
        data.add(row6);

        Map<String, Object> row7 = new HashMap<>();
        row7.put("emp_hire_date", LocalDate.parse("2024/12/09", formatter));
        row7.put("emp_num", "241209004008");
        row7.put("emp_name", "이사원");
        row7.put("emp_dept", "개발팀");
        row7.put("emp_position", "사원");
        row7.put("emp_email", "test7@gmail.com");
        data.add(row7);

        Map<String, Object> row8 = new HashMap<>();
        row8.put("emp_hire_date", LocalDate.parse("2024/12/09", formatter));
        row8.put("emp_num", "241209004008");
        row8.put("emp_name", "박사원");
        row8.put("emp_dept", "개발팀");
        row8.put("emp_position", "사원");
        row8.put("emp_email", "test8@gmail.com");
        data.add(row8);

        return data;
    }
}

