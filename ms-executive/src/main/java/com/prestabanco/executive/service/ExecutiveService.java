package com.prestabanco.executive.service;

import com.prestabanco.executive.entity.Executive;
import com.prestabanco.executive.models.ExecutiveLoginRequest;
import com.prestabanco.executive.models.ExecutiveLoginResponse;
import com.prestabanco.executive.repository.ExecutiveRepository;
import org.springframework.stereotype.Service;

@Service
public class ExecutiveService {

    private final ExecutiveRepository executiveRepository;

    public ExecutiveService(ExecutiveRepository executiveRepository) {
        this.executiveRepository = executiveRepository;
    }

    public Executive findById(long id) { return executiveRepository.findById(id).get(); }

    public Executive save(Executive executive) { return executiveRepository.save(executive); }

    public ExecutiveLoginResponse loginExecutive(ExecutiveLoginRequest request) {
        Executive executive = executiveRepository.findFirstByEmail(request.getEmail());
        if (executive.getPassword() == null) {
            return new ExecutiveLoginResponse(null, null);
        }
        if (executive.getEmail() != null) {
            return new ExecutiveLoginResponse(executive.getId(), null);
        }
        return new ExecutiveLoginResponse(null, null);
    }

}
