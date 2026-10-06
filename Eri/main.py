import os
import asyncio
import tempfile
import datetime
import subprocess
import webbrowser

import speech_recognition as sr
import wikipedia
import edge_tts
import pygame

# =========================================================
# Configuración general
# =========================================================
nombre = "eri"  # palabra de activación (comparamos en minúsculas)

# --- Voz (edge-tts) ---
# No existe una voz infantil real en español dentro de edge-tts, así que
# simulamos "voz de niña" tomando una voz femenina y subiéndole el tono (pitch)
# y la velocidad. Es una aproximación, no una voz infantil genuina.
# Puedes escuchar más voces en español con: edge-tts --list-voices | grep es-
VOZ_BASE = "es-MX-DaliaNeural"
TONOS = {
    "neutral":     {"voice": VOZ_BASE, "rate": "+8%",  "pitch": "+35Hz"},
    "alegre":      {"voice": VOZ_BASE, "rate": "+20%", "pitch": "+55Hz"},
    "seria":       {"voice": VOZ_BASE, "rate": "+3%",  "pitch": "+20Hz"},
    "calida":      {"voice": VOZ_BASE, "rate": "+0%",  "pitch": "+30Hz"},
    "entusiasta":  {"voice": VOZ_BASE, "rate": "+25%", "pitch": "+50Hz"},
}
TONO_POR_DEFECTO = "neutral"

# Cómo se dirige Eri a ti en sus respuestas
TRATAMIENTO = "padre"

pygame.mixer.init()
escuchar = sr.Recognizer()


# =========================================================
# Voz: síntesis con tono
# =========================================================
async def _sintetizar(texto, tono):
    cfg = TONOS.get(tono, TONOS[TONO_POR_DEFECTO])
    comunicador = edge_tts.Communicate(
        texto, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"]
    )
    ruta_temporal = tempfile.mktemp(suffix=".mp3")
    await comunicador.save(ruta_temporal)
    return ruta_temporal


def talk(texto, tono=TONO_POR_DEFECTO):
    print(f"Eri [{tono}]: {texto}")
    try:
        ruta = asyncio.run(_sintetizar(texto, tono))
        pygame.mixer.music.load(ruta)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        pygame.mixer.music.unload()
        os.remove(ruta)
    except Exception as e:
        print(f"Error generando/reproduciendo voz: {e}")


# =========================================================
# Reconocimiento de voz
# =========================================================
def tomar():
    """Escucha el micrófono y devuelve el texto reconocido en minúsculas.
    Devuelve cadena vacía si no se entendió nada o hubo un error."""
    rec = ""
    try:
        with sr.Microphone() as source:
            escuchar.adjust_for_ambient_noise(source, duration=0.5)
            print("Escuchando...")
            voice = escuchar.listen(source, timeout=5, phrase_time_limit=8)
            rec = escuchar.recognize_google(voice, language="es-ES")
            rec = rec.lower()
            print("Escuché:", rec)
    except sr.WaitTimeoutError:
        print("No se detectó voz (timeout).")
    except sr.UnknownValueError:
        print("No entendí el audio.")
    except sr.RequestError as e:
        print(f"Error con el servicio de reconocimiento: {e}")
    except Exception as e:
        print(f"Error inesperado en tomar(): {e}")
    return rec


# =========================================================
# Acciones (antes eran "tools" de Claude, ahora funciones directas)
# =========================================================
def accion_obtener_hora():
    ahora = datetime.datetime.now()
    return f"Son las {ahora.strftime('%H:%M')} del {ahora.strftime('%d/%m/%Y')}, {TRATAMIENTO}."


def accion_buscar_wikipedia(consulta):
    wikipedia.set_lang("es")
    try:
        resumen = wikipedia.summary(consulta, sentences=2)
        return f"{resumen} Eso encontré, {TRATAMIENTO}."
    except wikipedia.exceptions.DisambiguationError as e:
        opciones = ", ".join(e.options[:3])
        return f"Hay varios resultados para eso, {TRATAMIENTO}, por ejemplo: {opciones}. Sé más específico."
    except wikipedia.exceptions.PageError:
        return f"No encontré nada sobre eso, {TRATAMIENTO}."
    except Exception:
        return f"Hubo un problema buscando en Wikipedia, {TRATAMIENTO}."


# Apps comunes en Windows: nombre en español -> comando para abrirlas.
# Agrega aquí las tuyas (rutas completas si no están en el PATH).
APPS_CONOCIDAS = {
    "bloc de notas": "notepad",
    "notas": "notepad",
    "calculadora": "calc",
    "explorador de archivos": "explorer",
    "word": "winword",
    "excel": "excel",
    "powerpoint": "powerpnt",
    "spotify": "spotify",
    "chrome": "chrome",
    "navegador": "chrome",
    "vscode": "code",
    "visual studio code": "code",
    "cmd": "cmd",
    "terminal": "wt",
    "paint": "mspaint",
}


def accion_abrir_aplicacion(texto):
    # texto ya viene sin la palabra "abre"/"abrir", ej. "la calculadora"
    texto = texto.replace(" la ", " ").replace(" el ", " ").strip()

    for clave, comando in APPS_CONOCIDAS.items():
        if clave in texto:
            try:
                subprocess.Popen(comando, shell=True)
                return f"Abriendo {clave}, {TRATAMIENTO}."
            except Exception as e:
                print(f"Error abriendo aplicación '{clave}': {e}")
                return f"No pude abrir {clave}, {TRATAMIENTO}."

    return (
        f"No reconozco esa aplicación, {TRATAMIENTO}. Puedo abrir: "
        + ", ".join(sorted(set(APPS_CONOCIDAS.keys())))
        + "."
    )


# Sitios comunes: palabra clave -> URL. Si el usuario dice otra cosa,
# se intenta armar la URL directamente con lo que dijo (ej. "abre wikipedia.com").
SITIOS_CONOCIDOS = {
    "youtube": "https://youtube.com",
    "google": "https://google.com",
    "gmail": "https://mail.google.com",
    "correo": "https://mail.google.com",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "whatsapp": "https://web.whatsapp.com",
    "github": "https://github.com",
    "netflix": "https://netflix.com",
}


def accion_abrir_pagina_web(texto):
    texto = texto.strip()

    for clave, url in SITIOS_CONOCIDOS.items():
        if clave in texto:
            try:
                webbrowser.open(url)
                return f"Abriendo {clave}, {TRATAMIENTO}."
            except Exception as e:
                print(f"Error abriendo '{clave}': {e}")
                return f"No pude abrir {clave}, {TRATAMIENTO}."

    # No está en el diccionario: intentamos armar una URL con lo que dijo
    sitio = texto.replace(" ", "")
    if sitio:
        if not sitio.startswith(("http://", "https://")):
            sitio = "https://" + sitio
        try:
            webbrowser.open(sitio)
            return f"Abriendo {texto}, {TRATAMIENTO}."
        except Exception as e:
            print(f"Error abriendo '{texto}': {e}")
            return f"No pude abrir {texto}, {TRATAMIENTO}."

    return f"¿Qué página quieres que abra, {TRATAMIENTO}?"


# =========================================================
# Bucle principal: todo por palabras clave, sin API externa
# =========================================================
def procesar_comando(rec):
    if not rec:
        return True

    if nombre not in rec:
        return True

    rec = rec.replace(nombre, "").strip()

    if not rec:
        talk(f"Dime, {TRATAMIENTO}", "neutral")
        return True

    if any(palabra in rec for palabra in ["adiós", "salir", "apágate", "termina"]):
        talk(f"Hasta luego, {TRATAMIENTO}", "calida")
        return False

    if "hora" in rec:
        talk(accion_obtener_hora(), "neutral")

    elif "busca" in rec:
        consulta = rec.replace("busca", "").strip()
        if consulta:
            talk(accion_buscar_wikipedia(consulta), "neutral")
        else:
            talk(f"¿Qué quieres que busque, {TRATAMIENTO}?", "neutral")

    elif "abre" in rec or "abrir" in rec:
        resto = rec.replace("abre", "").replace("abrir", "").strip()
        # Si menciona un sitio conocido o parece una URL, lo tratamos como página web
        if any(s in resto for s in SITIOS_CONOCIDOS) or ".com" in resto or ".mx" in resto:
            talk(accion_abrir_pagina_web(resto), "neutral")
        else:
            talk(accion_abrir_aplicacion(resto), "neutral")

    else:
        talk(f"No entendí lo que dijiste, {TRATAMIENTO}.", "neutral")

    return True


def run_eri():
    talk(f"Eri activada. ¡Hola, {TRATAMIENTO}!", "alegre")
    activo = True
    try:
        while activo:
            rec = tomar()
            activo = procesar_comando(rec)
    except KeyboardInterrupt:
        print("\nInterrumpido con Ctrl+C, cerrando Eri...")
        talk(f"Hasta luego, {TRATAMIENTO}", "calida")


if __name__ == "__main__":
    run_eri()