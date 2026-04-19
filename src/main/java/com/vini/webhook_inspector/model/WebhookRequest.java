package com.vini.webhook_inspector.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "webhook_requests")
public class WebhookRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String channelId;   // identifica a URL única ex: /hook/abc123
    private String method;      // GET, POST, PUT...
    private String sourceIp;    // IP de quem enviou
    private LocalDateTime receivedAt;

    @Column(columnDefinition = "TEXT")
    private String headers;     // todos os headers em formato JSON

    @Column(columnDefinition = "TEXT")
    private String body;        // body cru da requisição

    @PrePersist
    public void prePersist() {
        this.receivedAt = LocalDateTime.now();
    }
}