package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    private ResourceResponseDTO toDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .description(r.getDescription())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return toDTO(resource);
    }

    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .availabilityStart(dto.getAvailabilityStart())
                .availabilityEnd(dto.getAvailabilityEnd())
                .status(ResourceStatus.ACTIVE)
                .build();
        return toDTO(resourceRepository.save(resource));
    }

    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setDescription(dto.getDescription());
        resource.setAvailabilityStart(dto.getAvailabilityStart());
        resource.setAvailabilityEnd(dto.getAvailabilityEnd());
        return toDTO(resourceRepository.save(resource));
    }

    public ResourceResponseDTO updateResourceStatus(String id, ResourceStatus newStatus) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setStatus(newStatus);
        return toDTO(resourceRepository.save(resource));
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    public List<ResourceResponseDTO> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ResourceResponseDTO> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ResourceResponseDTO> searchResources(ResourceType type, ResourceStatus status,
                                                     String location, Integer minCapacity) {
        return resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> location == null || location.isBlank() ||
                        r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> minCapacity == null || r.getCapacity() == null ||
                        r.getCapacity() >= minCapacity)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}