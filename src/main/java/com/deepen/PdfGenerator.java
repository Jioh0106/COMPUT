package com.deepen;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PdfGenerator {

    private final TemplateEngine templateEngine;

    public byte[] generatePdf(String html) throws Exception {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(outputStream);
            
            return outputStream.toByteArray();
        }
    }
}
