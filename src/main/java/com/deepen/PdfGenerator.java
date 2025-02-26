package com.deepen;

import java.io.ByteArrayOutputStream;
import java.io.File;

import org.springframework.stereotype.Component;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.lowagie.text.pdf.BaseFont;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class PdfGenerator {
    
    private static final String[] FONT_PATHS = {
        "C:/Windows/Fonts/malgun.ttf",  // Windows
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",  // Linux
        "/Library/Fonts/AppleGothic.ttf"  // Mac
    };
    
    public byte[] generatePdf(String html) throws Exception {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            
            // 사용 가능한 폰트 찾기
            boolean fontLoaded = false;
            for (String fontPath : FONT_PATHS) {
                File fontFile = new File(fontPath);
                if (fontFile.exists()) {
                    renderer.getFontResolver().addFont(
                        fontPath,
                        BaseFont.IDENTITY_H, 
                        BaseFont.NOT_EMBEDDED
                    );
                    fontLoaded = true;
                    log.info("사용한 폰트: {}", fontPath);
                    break;
                }
            }
            
            if (!fontLoaded) {
                log.warn("한글 폰트를 찾을 수 없습니다. 기본 폰트를 사용합니다.");
            }
            
            // 문서 렌더링
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(outputStream, true);
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("PDF 생성 중 오류 발생", e);
            throw new RuntimeException("PDF 생성 중 오류 발생: " + e.getMessage(), e);
        }
    }
}