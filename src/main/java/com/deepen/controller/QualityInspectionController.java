// QualityInspectionController.java
package com.deepen.controller;

import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.service.QualityInspectionService;

@Controller
@RequestMapping
public class QualityInspectionController {

    private final QualityInspectionService qualityInspectionService;

    public QualityInspectionController(QualityInspectionService qualityInspectionService) {
        this.qualityInspectionService = qualityInspectionService;
    }

    @GetMapping("/quality-inspection")
    public String showInspectionPage(Model model) {
        List<ProcessInfoDTO> processes = qualityInspectionService.getAllProcessInfo();
        model.addAttribute("processes", processes);
        return "quality/inspection";
    }
    
    @GetMapping("/quality-history")
    public String showHistoryPage(Model model) {
        List<ProcessInfoDTO> processes = qualityInspectionService.getAllProcessInfo();
        model.addAttribute("processes", processes);
        return "quality/inspection_history";
    }
}