import cv2
import math
import matplotlib.pyplot as plt
import numpy as np
import random
import turtle
from queue import Queue

def cube_add(v, w):
    return (v[0] + w[0], v[1] + w[1], v[2] + w[2])

# Flat-top
# def cube_to_coords(size, q, r):
#     x = size * (3*q/2)
#     y = size * (math.sqrt(3)*(r + q/2))
#     return [x, y]

# def coords_to_cube(size, x, y):
#     q = 2/3 * x/size
#     r = -1/3 * x/size + math.sqrt(3)/3 * y/size
#     s = -q-r
#     return [q, r, s]

# Pointy-top
def cube_to_coords(size, q, r):
    """Convierte coordenadas hexagonales cúbicas (q, r, s) a coordenadas cartesianas (x, y) para hexágonos 'pointy-top'."""
    x = size * math.sqrt(3) * (q + r / 2)
    y = size * (3/2) * r
    return [x, y]

def coords_to_cube(size, x, y):
    """Convierte coordenadas cartesianas (x, y) a coordenadas hexagonales cúbicas (q, r, s) para hexágonos 'pointy-top'."""
    q = (math.sqrt(3)/3 * x - 1/3 * y) / size
    r = (2/3 * y) / size
    s = -q - r
    return [q, r, s]

def cube_distance(v=(0,0,0), w=(0,0,0)):
    return (abs(w[0]-v[0]) + abs(w[1]-v[1]) + abs(w[2]-v[2]))/2

def cube_to_string(cube):
    return f"{cube[0]},{cube[1]},{cube[2]}"

def coords_in_contours(coords, contours):
    x, y = coords
    for contour in contours:
        result = cv2.pointPolygonTest(contour, (x, y), False)
        if result >= 0:  # 1 = dentro, 0 = en el borde
            return True
    return False

# Cargar la imagen
image_path = "image_3.png"
image = cv2.imread(image_path)

# Convertir a escala de grises y detectar bordes
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (3, 3), 0)  # Suaviza la imagen
edges = cv2.Canny(blurred, 10, 50)

# Encontrar contornos en la imagen original
closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8))
contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Dibujar los contornos en la imagen original
contour_image = np.ones_like(image) * 255  # Imagen con fondo blanco
for i, contour in enumerate(contours):
    print(i)
    cv2.drawContours(contour_image, [contour], 0, (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)), 2)

# Encontrar el rectángulo delimitador más ajustado
x, y, w, h = cv2.boundingRect(np.vstack(contours))
margin = 30  # Margen extra alrededor del contorno

# Calcular los límites asegurando que no salgan de la imagen
ymin = max(0, y - margin)
ymax = min(image.shape[0], y + h + margin)
xmin = max(0, x - margin)
xmax = min(image.shape[1], x + w + margin)

# Recortar la imagen
contour_image = contour_image[ymin:ymax, xmin:xmax]
contours = [contour - np.array([xmin, ymin]) for contour in contours]

t = turtle.Turtle()
t.speed(0)
size = 30
# q,r,s
dirs = [
    ( 0, 0, 0),
    (-1,+1, 0),
    (-1, 0,+1),
    (+1,-1, 0),
    (+1, 0,-1),
    ( 0,-1,+1),
    ( 0,+1,-1),
]

distance = 1
border   = set([(0,0,0)])
expand   = set()
bqueue   = Queue()
bqueue.put((0,0,0))
board = {}
while border:
    cube = bqueue.get()
    border.remove(cube)
    expand.add(cube)
    for dir in dirs:
        next_cube = cube_add(cube, dir)
        next_cube_id = cube_to_string(next_cube)
        # if (next_cube_id in board or cube_distance(w=next_cube) > distance):
        if (next_cube_id in board):
            continue
        coords    = cube_to_coords(size, next_cube[0], next_cube[1])
        coords_cv = [coords[0] + contour_image.shape[1]//2, coords[1] + contour_image.shape[0]//2]
        if (coords_in_contours(coords_cv, contours)):
            t.penup()
            t.goto(coords[0], -coords[1])
            t.pendown()
            t.setheading(30)
            for _ in range(6):
                t.forward(size)
                t.right(60)
            board[next_cube_id] = 0
            cv2.circle(contour_image, (int(coords_cv[0]), int(coords_cv[1])), 3, (255, 0, 0), -1)
        # print(coords_cv, xmin, xmax, ymin, ymax)
        if (coords_cv[0] > 0 and coords_cv[0] < contour_image.shape[1] and coords_cv[1] > 0 and coords_cv[1] < contour_image.shape[0] and next_cube not in border and next_cube not in expand):
            border.add(next_cube)
            bqueue.put(next_cube)

turtle.done()

# print(board)

plt.figure(figsize=(10,5))
plt.subplot(1,2,1)
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.title("Imagen Original")
plt.axis("off")

plt.subplot(1,2,2)
plt.imshow(cv2.cvtColor(contour_image, cv2.COLOR_BGR2RGB))
plt.title("Contornos Detectados")
plt.axis("off")

plt.show()
