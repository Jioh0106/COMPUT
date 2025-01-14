package com.deepen;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Component;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.lowagie.text.pdf.BaseFont;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PdfGenerator {
    
    public byte[] generatePdf(String html) throws Exception {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            
            // 한글 폰트 설정
            renderer.getFontResolver().addFont(
                "C:/Windows/Fonts/malgun.ttf",  // 윈도우 환경
                BaseFont.IDENTITY_H, 
                BaseFont.NOT_EMBEDDED
            );
            
            // 기본 CSS 스타일 적용
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(outputStream, true);
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF 생성 중 오류 발생: " + e.getMessage(), e);
        }
    }
}
