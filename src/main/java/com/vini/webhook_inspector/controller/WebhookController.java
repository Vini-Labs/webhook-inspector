package com.vini.webhook_inspector.controller;

import com.vini.webhook_inspector.model.WebhookRequest;
import com.vini.webhook_inspector.service.WebhookService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService service;
    private final ObjectMapper objectMapper;

    @RequestMapping("/hook/{channelId}")
    public ResponseEntity<String> receiveWebhook(
            @PathVariable String channelId,
            @RequestBody(required = false) String body,
            HttpServletRequest request) throws Exception {

        Map<String, String> headersMap = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            headersMap.put(name, request.getHeader(name));
        }

        WebhookRequest webhook = new WebhookRequest();
        webhook.setChannelId(channelId);
        webhook.setMethod(request.getMethod());
        webhook.setSourceIp(request.getRemoteAddr());
        webhook.setHeaders(objectMapper.writeValueAsString(headersMap));
        webhook.setBody(body);

        service.save(webhook);

        return ResponseEntity.ok("Webhook recebido!");
    }

    @GetMapping("/hook/{channelId}/requests")
    public List<WebhookRequest> getRequests(@PathVariable String channelId) {
        return service.findByChannel(channelId);
    }

    @DeleteMapping("/hook/{channelId}/requests")
    public ResponseEntity<String> clearRequests(@PathVariable String channelId) {
        service.clearByChannel(channelId);
        return ResponseEntity.ok("Histórico limpo!");
    }
}