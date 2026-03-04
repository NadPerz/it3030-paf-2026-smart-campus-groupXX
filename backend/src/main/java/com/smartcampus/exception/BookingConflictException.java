package com.smartcampus.exception;

/** Thrown when a booking conflicts with an existing booking — maps to HTTP 409. */
public class BookingConflictException extends RuntimeException {

    public BookingConflictException(String message) {
        super(message);
    }
}
