package com.vini.webhook_inspector.service;

import com.vini.webhook_inspector.model.WebhookRequest;
import com.vini.webhook_inspector.repository.WebhookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WebhookService {

    private final WebhookRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public WebhookRequest save(WebhookRequest request) {
        WebhookRequest saved = repository.save(request);

        // Notifica o painel em tempo real
        messagingTemplate.convertAndSend(
            "/topic/hooks/" + saved.getChannelId(),
            saved
        );

        return saved;
    }

    public List<WebhookRequest> findByChannel(String channelId) {
        return repository.findByChannelIdOrderByReceivedAtDesc(channelId);
    }

    public void clearByChannel(String channelId) {
    List<WebhookRequest> requests = repository.findByChannelIdOrderByReceivedAtDesc(channelId);
    repository.deleteAll(requests);
}
}