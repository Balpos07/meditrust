from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websockets import manager
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/live-board")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We just need to keep the connection alive
            # Wait for any incoming message, though clients only receive
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
