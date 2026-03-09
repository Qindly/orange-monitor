import { createEventId } from './createEventId';

const SESSION_KEY = '__monitor_session_id__';

export function getSessionId(): string {
    try{
        const cached= sessionStorage.getItem(SESSION_KEY);  
        if(cached) return cached;

        const sessionId = createEventId();
        sessionStorage.setItem(SESSION_KEY, sessionId);
        return sessionId;
    }catch{
        return createEventId();
    }
}


