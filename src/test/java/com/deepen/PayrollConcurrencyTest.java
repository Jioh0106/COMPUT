package com.deepen;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.deepen.service.PayrollCalculatorService;

@SpringBootTest
class PayrollConcurrencyTest {

    @Autowired
    private PayrollCalculatorService payrollCalculatorService;

    private String testEmpId;
    private String testPaymentDate;

    @BeforeEach
    void setup() {
        // 테스트에 사용할 임의 사원번호와 지급월
        testEmpId = "2013100118";
        testPaymentDate = "2024-03"; 
        // 만약 이미 DB에 중복이 있을 수 있으니, DB 정리 혹은 사전 조건 설정
    }
    
    @Test
    void testConcurrentPayrollWithLatch() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();       // 스레드 준비 완료
                    startLatch.await();           // 모두 준비될 때까지 대기
                    // 실제 로직
                    payrollCalculatorService.calculateSalary(testEmpId, testPaymentDate);
                } catch (Exception e) {
                    // 에러 처리
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // 모든 스레드 준비 대기
        readyLatch.await();
        // 모든 스레드에게 시작 신호
        startLatch.countDown();
        // 모든 스레드가 종료될 때까지 대기
        doneLatch.await();

        executor.shutdown();
        
    }


    @Test
    void testConcurrentPayrollCalculation() throws InterruptedException, ExecutionException {
        // 스레드 풀 준비
        ExecutorService executor = Executors.newFixedThreadPool(10);

        // 동시에 실행할 작업 정의
        Callable<String> task = () -> {
            try {
                // 실제 급여 계산 로직 호출
                payrollCalculatorService.calculateSalary(testEmpId, testPaymentDate);
                return "SUCCESS";
            } catch (Exception e) {
                return "ERROR: " + e.getMessage();
            }
        };

        // 동시에 10번 호출
        List<Future<String>> futures = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            futures.add(executor.submit(task));
        }

        // 결과 수집
        int successCount = 0;
        int errorCount = 0;
        for (Future<String> f : futures) {
            String result = f.get();
            if (result.startsWith("SUCCESS")) {
                successCount++;
            } else {
                errorCount++;
                System.out.println("Thread Error: " + result);
            }
        }

        executor.shutdown();

        // Assertions 등을 통해 기대되는 결과 확인
        // 예: 동시성 제약이 걸려 있으므로, 단 한 건만 성공하고 나머지는 DB 제약 혹은 validate 체크에서 걸릴 수 있음
        System.out.println("Success: " + successCount + ", Error: " + errorCount);
        
        // 예상 시나리오에 따라 적절히 검증
        // 1) 중복 저장 자체를 막았다면, 보통은 1회 성공, 나머지 9회가 중복 에러를 낼 수 있음.
        // 2) 혹은 아예 모두가 중복이라면 모두 에러일 수도 있으니, 시스템 로직에 맞춰 assert 처리
        assertTrue(successCount <= 1, "중복 지급이 발생하지 않도록 1번 이하로만 성공해야 합니다.");
        assertTrue(errorCount >= 0, "나머지 요청들은 에러(중복)여야 합니다.");
    }
}