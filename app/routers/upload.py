# app/routers/upload.py
import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.database import get_db
from app.config import settings
from app.utils.auth import get_current_admin_user, get_current_active_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{settings.API_PREFIX}/upload", tags=["Upload"])

# Configurazione upload
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
ALLOWED_MODEL_EXTENSIONS = {'.stl', '.obj', '.3mf', '.gcode'}
MAX_IMAGE_SIZE = settings.MAX_UPLOAD_SIZE  # 5MB
MAX_MODEL_SIZE = settings.MAX_UPLOAD_SIZE * 4  # 20MB

# Crea directory uploads se non esiste
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)

# Crea subdirectories
(UPLOAD_DIR / "categories").mkdir(exist_ok=True)
(UPLOAD_DIR / "designs").mkdir(exist_ok=True)
(UPLOAD_DIR / "models").mkdir(exist_ok=True)
(UPLOAD_DIR / "avatars").mkdir(exist_ok=True)


def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    """Valida l'estensione del file"""
    extension = Path(filename).suffix.lower()
    return extension in allowed_extensions


def validate_file_size(file: UploadFile, max_size: int) -> bool:
    """Valida la dimensione del file"""
    file.file.seek(0, 2)  # Vai alla fine del file
    file_size = file.file.tell()  # Ottieni la posizione (dimensione)
    file.file.seek(0)  # Torna all'inizio
    return file_size <= max_size


def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    """Salva il file caricato"""
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()


def generate_unique_filename(original_filename: str) -> str:
    """Genera un nome file univoco preservando l'estensione"""
    extension = Path(original_filename).suffix.lower()
    unique_id = uuid.uuid4().hex[:12]
    return f"{unique_id}{extension}"


@router.post("/category-image", dependencies=[Depends(get_current_admin_user)])
async def upload_category_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload immagine per categoria (solo admin)

    Returns: URL dell'immagine caricata
    """
    # Validazione estensione
    if not validate_file_extension(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estensione file non permessa. Permesse: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # Validazione dimensione
    if not validate_file_size(file, MAX_IMAGE_SIZE):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File troppo grande. Massimo {MAX_IMAGE_SIZE / 1024 / 1024}MB"
        )

    # Genera nome file univoco
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / "categories" / unique_filename

    # Salva il file
    save_upload_file(file, file_path)

    # Genera URL
    file_url = f"/uploads/categories/{unique_filename}"

    logger.info(f"Admin uploaded category image: {unique_filename}")

    return {
        "filename": unique_filename,
        "url": file_url,
        "size": file.size if hasattr(file, 'size') else None
    }


@router.post("/design-image", dependencies=[Depends(get_current_admin_user)])
async def upload_design_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload immagine per design (solo admin)

    Returns: URL dell'immagine caricata
    """
    # Validazione estensione
    if not validate_file_extension(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estensione file non permessa. Permesse: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # Validazione dimensione
    if not validate_file_size(file, MAX_IMAGE_SIZE):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File troppo grande. Massimo {MAX_IMAGE_SIZE / 1024 / 1024}MB"
        )

    # Genera nome file univoco
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / "designs" / unique_filename

    # Salva il file
    save_upload_file(file, file_path)

    # Genera URL
    file_url = f"/uploads/designs/{unique_filename}"

    logger.info(f"Admin uploaded design image: {unique_filename}")

    return {
        "filename": unique_filename,
        "url": file_url,
        "size": file.size if hasattr(file, 'size') else None
    }


@router.post("/design-model", dependencies=[Depends(get_current_admin_user)])
async def upload_design_model(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload modello 3D per design (solo admin)

    Formati supportati: STL, OBJ, 3MF, GCODE

    Returns: URL del modello caricato
    """
    # Validazione estensione
    if not validate_file_extension(file.filename, ALLOWED_MODEL_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estensione file non permessa. Permesse: {', '.join(ALLOWED_MODEL_EXTENSIONS)}"
        )

    # Validazione dimensione
    if not validate_file_size(file, MAX_MODEL_SIZE):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File troppo grande. Massimo {MAX_MODEL_SIZE / 1024 / 1024}MB"
        )

    # Genera nome file univoco
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / "models" / unique_filename

    # Salva il file
    save_upload_file(file, file_path)

    # Genera URL
    file_url = f"/uploads/models/{unique_filename}"

    logger.info(f"Admin uploaded 3D model: {unique_filename}")

    return {
        "filename": unique_filename,
        "url": file_url,
        "size": file.size if hasattr(file, 'size') else None,
        "format": Path(file.filename).suffix.lower()
    }


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload avatar utente (utenti autenticati)

    Returns: URL dell'avatar caricato
    """
    # Validazione estensione
    if not validate_file_extension(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estensione file non permessa. Permesse: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # Validazione dimensione (max 2MB per avatar)
    max_avatar_size = 2 * 1024 * 1024  # 2MB
    if not validate_file_size(file, max_avatar_size):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File troppo grande. Massimo {max_avatar_size / 1024 / 1024}MB"
        )

    # Genera nome file univoco con user_id
    extension = Path(file.filename).suffix.lower()
    unique_filename = f"user_{current_user.id}_{uuid.uuid4().hex[:8]}{extension}"
    file_path = UPLOAD_DIR / "avatars" / unique_filename

    # Elimina vecchio avatar se esiste
    # (puoi implementare logica per tenere traccia e eliminare i vecchi file)

    # Salva il file
    save_upload_file(file, file_path)

    # Genera URL
    file_url = f"/uploads/avatars/{unique_filename}"

    logger.info(f"User {current_user.email} uploaded avatar: {unique_filename}")

    return {
        "filename": unique_filename,
        "url": file_url,
        "size": file.size if hasattr(file, 'size') else None
    }


@router.delete("/file", dependencies=[Depends(get_current_admin_user)])
async def delete_uploaded_file(
    file_url: str,
    db: Session = Depends(get_db)
):
    """
    Elimina un file caricato (solo admin)

    Args:
        file_url: URL del file da eliminare (es: /uploads/categories/abc123.jpg)
    """
    # Estrai il path relativo dal URL
    if not file_url.startswith("/uploads/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL file non valido"
        )

    # Rimuovi /uploads/ dall'inizio
    relative_path = file_url.replace("/uploads/", "")
    file_path = UPLOAD_DIR / relative_path

    # Verifica che il file esista
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File non trovato"
        )

    # Verifica che il file sia all'interno della directory uploads (sicurezza)
    try:
        file_path.resolve().relative_to(UPLOAD_DIR.resolve())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operazione non permessa"
        )

    # Elimina il file
    file_path.unlink()

    logger.warning(f"Admin deleted file: {file_url}")

    return {
        "message": "File eliminato con successo",
        "file_url": file_url
    }
