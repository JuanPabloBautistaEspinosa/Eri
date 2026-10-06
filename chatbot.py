from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Cada tupla es (pregunta, respuesta) — deben estar alineadas
entrenamiento = [
    ("Hola, ¿Quien eres?", "Soy Eri, tu asistente virtual."),
    ("¿Necesitas ayuda?", "Claro que sí, ¿en qué puedo ayudarte?"),
    ("¿Dónde está la estación de tren?", "La estación de tren está a dos cuadras de aquí."),
]

# Separamos preguntas y respuestas, ya alineadas
preguntas = [par[0] for par in entrenamiento]
respuestas = [par[1] for par in entrenamiento]

vectorizer = CountVectorizer()
x = vectorizer.fit_transform(preguntas)  # <- se vectorizan las PREGUNTAS, no las tuplas

modelo = MultinomialNB()
modelo.fit(x, respuestas)

while True:
    entrada = input("Tú: ")
    if entrada.lower() == "salir":
        print("Eri: ¡Hasta luego!")
        break

    entrada_vector = vectorizer.transform([entrada])
    respuesta = modelo.predict(entrada_vector)
    print("Eri: " + respuesta[0])
    