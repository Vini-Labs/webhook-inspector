package com.vini.webhook_inspector.repository;

import com.vini.webhook_inspector.model.WebhookRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WebhookRepository extends JpaRepository<WebhookRequest, Long> {

    List<WebhookRequest> findByChannelIdOrderByReceivedAtDesc(String channelId);

}