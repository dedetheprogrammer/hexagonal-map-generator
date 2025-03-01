
const ToString = (hexagon) => {
    return `${hexagon.q},${hexagon.r},${hexagon.s}`
}
const ToHex = (string)  => {
    hexagon = string.split(',')
    return {q:Number(hexagon[0]), r:Number(hexagon[1]), s:Number(hexagon[2])}
}

const Hexagon = {
    Directions: [
        {q: 0, r: 0, s: 0},
        {q:-1, r:+1, s: 0},
        {q:-1, r: 0, s:+1},
        {q:+1, r:-1, s: 0},
        {q:+1, r: 0, s:-1},
        {q: 0, r:-1, s:+1},
        {q: 0, r:+1, s:-1}
    ],
    Operations: {
        FLAT_TOP: {
            angle: (index) => Math.PI/3 * index,
            coordsToHex: (coords, size) => {
                q = 2/3 * coords.x/size;
                r = -1/3 * coords.x/size + Math.sqrt(3)/3 * coords.y/size;
                s = -r-q;
                return { q,r,s }
            },
            hexToCoords: (hexagon, size) => {
                x = size * (3/2) * hexagon.q;
                y = size * (Math.sqrt(3)*(hexagon.r + hexagon.q/2))
                return { x,y }
            }
        },
        POINTY_TOP: {
            angle: (index) => Math.PI/3 * index - Math.PI/6,
            coordsToHex: (coords, size) => {
                q = (Math.sqrt(3)/3 * coords.x - 1/3 * coords.y) / size
                r = (2/3 * coords.y) / size
                s = -r-q
                return { q,r,s }
            },
            hexToCoords: (hex, size) => {
                x = size * Math.sqrt(3) * (hex.q+hex.r/2)
                y = size * (3/2) * hex.r
                return { x,y }
            }
        },
        distance: (hexagon1, hexagon2) => {
            return (Math.abs(hexagon2.q - hexagon1.q) + Math.abs(hexagon2.r - hexagon1.r) + Math.abs(hexagon2.s - hexagon1.s))/2
        } 
    }
}

const onRuntimeInitialized = async () => {
    window.cv = await window.cv;
    console.log("OpenCV ready!")
}



const Generate = {
    FROM_ZERO: () => {
        // Limpiar canvas
        const scaleFactor = 5;
        canvasMapGrid.width = canvasMapGridSize.width * scaleFactor;
        canvasMapGrid.height = canvasMapGridSize.height * scaleFactor;
        contextMapGrid.clearRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
        contextMapGrid.fillStyle = "#ffffff"
        contextMapGrid.fillRect(0, 0, canvasMapGrid.width, canvasMapGrid.height)
        // Variables para la propagacion
        const size   = (input_Size.checked) ? input_SizeThreshold.value : 15;
        const bqueue = [ToString({q:0,r:0,s:0})]
        const border = new Set(bqueue)
        const expand = new Set()
        const drawn  = new Set()
        // Bucle de la propagacion
        while (border.size > 0) {
            // Obtener hexagono
            let hexagon = bqueue.pop()
            border.delete(hexagon)
            expand.add(hexagon)
            hexagon = ToHex(hexagon)
            // Direcciones
            for (const direction of Hexagon.Directions) {
                const nextHexagon = { q:hexagon.q + direction.q, r:hexagon.r + direction.r, s:hexagon.s + direction.s };
                const nextHexagonId = ToString(nextHexagon);
                const nextHexagonDistance = Hexagon.Operations.distance({q:0, r:0, s:0}, nextHexagon)
                if (drawn.has(nextHexagonId) || nextHexagonDistance > input_DistanceThreshold.value || (input_Random.checked && Math.random() >= input_RandomThreshold.value)) {
                    continue;
                } else {
                    drawn.add(nextHexagonId);
                }
                // Obtener coordenadas del hexagono
                const coords     = Hexagon.Operations[input_Orientation.value].hexToCoords(nextHexagon, size)
                const coordsDraw = { x: coords.x + canvasMapGrid.width/2, y: coords.y + canvasMapGrid.height/2 }
                // Dibujar el hexagono
                contextMapGrid.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = Hexagon.Operations[input_Orientation.value].angle(i)
                    contextMapGrid.lineTo(
                        coordsDraw.x + size * Math.cos(angle),
                        coordsDraw.y + size * Math.sin(angle)
                    );
                }
                contextMapGrid.closePath();
                contextMapGrid.fillStyle = "#C7F08B";
                contextMapGrid.fill();
                contextMapGrid.stroke();
                // Agregar el siguiente hexagono 
                if (!border.has(nextHexagonId) && !expand.has(nextHexagonId)) {
                    border.add(nextHexagonId)
                    bqueue.push(nextHexagonId)
                }
            }
        }
    },
    FROM_FILE: () => {
        // Limpiar canvas
        contextMapGrid.clearRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
        contextMapGrid.fillStyle = "#ffffff"
        contextMapGrid.fillRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
        // Variables para la propagacion
        const size   = (input_Size.checked) ? input_SizeThreshold.value : 15;
        const bqueue = [ToString({q:0,r:0,s:0})]
        const border = new Set(bqueue)
        const expand = new Set()
        const drawn  = new Set()
        // Bucle de la propagacion
        while (border.size > 0) {
            // Obtener hexagono
            let hexagon = bqueue.pop()
            border.delete(hexagon)
            expand.add(hexagon)
            hexagon = ToHex(hexagon)
            // Direcciones
            for (const direction of Hexagon.Directions) {
                const nextHexagon = { q:hexagon.q + direction.q, r:hexagon.r + direction.r, s:hexagon.s + direction.s };
                const nextHexagonId = ToString(nextHexagon);
                const nextHexagonDistance = Hexagon.Operations.distance({q:0, r:0, s:0}, nextHexagon)
                if (drawn.has(nextHexagonId) || (input_Distance.checked && nextHexagonDistance > input_DistanceThreshold.value) || (input_Random.checked && Math.random() >= input_RandomThreshold.value)) {
                    continue;
                } else {
                    drawn.add(nextHexagonId);
                }
                // Obtener coordenadas del hexagono
                const coords     = Hexagon.Operations[input_Orientation.value].hexToCoords(nextHexagon, size)
                const coordsDraw = { x: coords.x + canvasMapGrid.width/2, y: coords.y + canvasMapGrid.height/2 }
                const coordsCont = { x: coords.x + contoursData.width/2, y: coords.y + contoursData.height/2 }
                // Verificar si hay que dibujar o no el hexagono
                let coordsInContours = false;
                for (let i = 0; i < contoursData.contours.size(); i++) {
                    const contour = contoursData.contours.get(i);
                    if (cv.pointPolygonTest(contour, new cv.Point(coordsCont.x, coordsCont.y), false) >= 0) {
                        coordsInContours = true;
                        break;
                    }
                }
                // Dibujar el hexagono
                if (coordsInContours) {
                    contextMapGrid.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = Hexagon.Operations[input_Orientation.value].angle(i)
                        contextMapGrid.lineTo(
                            coordsDraw.x + size * Math.cos(angle),
                            coordsDraw.y + size * Math.sin(angle)
                        );
                    }
                    contextMapGrid.closePath();
                    contextMapGrid.fillStyle = "#C7F08B";
                    contextMapGrid.fill();
                    contextMapGrid.stroke();
                }
                // Agregar el siguiente hexagono 
                if (coordsCont.x > 0 && coordsCont.x < contoursData.width && coordsCont.y > 0 && coordsCont.y < contoursData.height && !border.has(nextHexagonId) && !expand.has(nextHexagonId)) {
                    border.add(nextHexagonId)
                    bqueue.push(nextHexagonId)
                }
            }
        }
    }
}

const canvasPreview = document.getElementById('canvas_Preview')
const contextPreview = canvasPreview.getContext('2d', { willReadFrequently: true })
const canvasContour = document.getElementById('canvas_Contour')
const contextContour = canvasContour.getContext('2d', { willReadFrequently: true })
const canvasMapGrid = document.getElementById('canvas_MapGrid')
const contextMapGrid = canvasMapGrid.getContext('2d')
const contextMapGridParent = document.getElementById('main-section-canvases-canvas-main');
const canvasMapGridSize = { width: canvasMapGrid.width, height: canvasMapGrid.height }

// --------------------------------------
// Options
// --------------------------------------
// - Orientation
let input_Orientation = document.getElementById("input_Orientation_Flat");
document.querySelectorAll('input[name="input_Orientation"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        input_Orientation = event.target;
        if (file === undefined) {
        Generate["FROM_ZERO"]()
        } else if (contoursData !== undefined) {
            Generate["FROM_FILE"]()
        }
    })
})
// - Distance
const input_Distance = document.getElementById("input_Distance");
input_Distance.addEventListener('input', (event) => {
    input_DistanceThreshold.disabled = !input_Distance.checked;
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (contoursData !== undefined) {
        Generate["FROM_FILE"]()
    }
})
const input_DistanceThreshold = document.getElementById("input_DistanceThreshold");
const value_DistanceThreshold = document.getElementById("value_DistanceThreshold");
input_DistanceThreshold.addEventListener('input', (event) => {
    value_DistanceThreshold.textContent = input_DistanceThreshold.value;
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (contoursData !== undefined) {
        Generate["FROM_FILE"]()
    }
})
// - Size
const input_Size = document.getElementById("input_Size");
input_Size.addEventListener('input', (event) => {
    input_SizeThreshold.disabled = !input_Size.checked;
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (contoursData !== undefined) {
        Generate["FROM_FILE"]()
    }
})
const input_SizeThreshold = document.getElementById("input_SizeThreshold");
const value_SizeThreshold = document.getElementById("value_SizeThreshold");
input_SizeThreshold.addEventListener('input', (event) => {
    value_SizeThreshold.textContent = input_SizeThreshold.value;
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (contoursData !== undefined) {
        Generate["FROM_FILE"]()
    }
})
// - Randomwalk
const input_Random = document.getElementById("input_Random");
input_Random.addEventListener('input', (event) => {
    input_RandomThreshold.disabled = !input_Random.checked;
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (contoursData !== undefined) {
        Generate["FROM_FILE"]()
    }
})
const input_RandomThreshold = document.getElementById("input_RandomThreshold");
const value_RandomThreshold = document.getElementById("value_RandomThreshold");
input_RandomThreshold.addEventListener('input', (event) => {
    value_RandomThreshold.textContent = input_RandomThreshold.value;
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (contoursData !== undefined) {
        Generate["FROM_FILE"]()
    }
})
// - Media
let file = undefined;
let contoursData = undefined;
const input_Media = document.getElementById('input_Media')
input_Media.addEventListener('change', async (event) => {
    file = event.target.files[0]
    if (file) {
        // Verificar el tipo de fichero
        if (file.type.startsWith("image/")) {
            // Iniciar opciones
            input_Distance.disabled = false;
            input_Distance.checked = false;
            input_DistanceThreshold.disabled = true;
            const videoPlayer = document.getElementById('video_Player')
            if (videoPlayer.src !== '') {
                videoPlayer.src   = ''
            }
            // Obtener imagen
            const path = new Image()
            const reader = new FileReader()
            reader.onload = (event) => {
                path.src = event.target.result;
            }
            reader.readAsDataURL(file)
            path.onload = (event) => {
                // Cargar la imagen
                let image = cv.imread(path);
                cv.imshow('canvas_Preview', image)
                // Convertir a escala de grises
                cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY)
                // Expansión de la imagen agregando un borde (blanco o negro segun el fondo)
                cv.copyMakeBorder(image, image, 2, 2, 2, 2, cv.BORDER_CONSTANT, cv.mean(image)[0] > 127 ? new cv.Scalar(255, 255, 255) : new cv.Scalar(0, 0, 0))
                // Aplicar desenfoque para reducir ruido
                cv.GaussianBlur(image, image, new cv.Size(5,5), 0)
                // Aplicar detección de bordes con Canny
                cv.Canny(image, image, 10, 50)
                // Cerrar los contornos
                const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
                cv.morphologyEx(image, image, cv.MORPH_CLOSE, kernel);
                kernel.delete()
                // Encontrar los contornos
                const contours  = new cv.MatVector()
                const hierarchy = new cv.Mat();
                cv.findContours(image, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
                if (contours.size() > 0) {
                    image = new cv.Mat(image.rows, image.cols, cv.CV_8UC3, new cv.Scalar(255, 255, 255));
                    for (let i = 0; i < contours.size(); i++) {
                        let color = new cv.Scalar(Math.random() * 255, Math.random() * 255, Math.random() * 255);
                        cv.drawContours(image, contours, i, color, 3);
                    }
                    // Encontrar el rectangulo delimitador mas ajustado
                    const points = []
                    for (let i = 0; i < contours.size(); i++) {
                        const contour = contours.get(i)
                        for (let j = 0; j < contour.data32S.length; j += 2) {
                            points.push([contour.data32S[j], contour.data32S[j+1]])
                        }
                    }
                    const pointsMat = cv.matFromArray(points.length, 1, cv.CV_32SC2, points.flat());
                    const boundingRect = cv.boundingRect(pointsMat);
                    pointsMat.delete()
                    // Aplicar el rectangulo encontrado
                    const margin = 30;
                    const xmin = Math.max(0, boundingRect.x - margin);
                    const ymin = Math.max(0, boundingRect.y - margin);
                    const xmax = Math.min(image.cols, boundingRect.x + boundingRect.width + margin);
                    const ymax = Math.min(image.rows, boundingRect.y + boundingRect.height + margin);
                    image = image.roi(new cv.Rect(xmin, ymin, xmax - xmin, ymax - ymin));
                    // Ajustar los contornos a la nueva región recortada
                    if (contoursData !== undefined) {
                        contoursData.contours.delete();
                    }
                    contoursData = {
                        contours: new cv.MatVector(),
                        width: xmax-xmin,
                        height: ymax-ymin
                    }
                    for (let i = 0; i < contours.size(); i++) {
                        let contour = contours.get(i);
                        let adjustedContour = new cv.Mat(contour.rows, contour.cols, contour.type());
                        for (let j = 0; j < contour.rows; j++) {
                            adjustedContour.data32S[j * 2] = contour.data32S[j * 2] - xmin;
                            adjustedContour.data32S[j * 2 + 1] = contour.data32S[j * 2 + 1] - ymin;
                        }
                        contoursData.contours.push_back(adjustedContour);
                        contour.delete();
                    }
                    
                    // Limpiar canvas
                    contextMapGrid.clearRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
                    contextMapGrid.fillStyle = "#ffffff"
                    contextMapGrid.fillRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
                    // Variables para la propagacion
                    const size   = (input_Size.checked) ? input_SizeThreshold.value : 15;
                    const bqueue = [ToString({q:0,r:0,s:0})]
                    const border = new Set(bqueue)
                    const expand = new Set()
                    const drawn  = new Set()
                    // Bucle de la propagacion
                    while (border.size > 0) {
                        // Obtener hexagono
                        let hexagon = bqueue.pop()
                        border.delete(hexagon)
                        expand.add(hexagon)
                        hexagon = ToHex(hexagon)
                        // Direcciones
                        for (const direction of Hexagon.Directions) {
                            const nextHexagon = { q:hexagon.q + direction.q, r:hexagon.r + direction.r, s:hexagon.s + direction.s };
                            const nextHexagonId = ToString(nextHexagon);
                            const nextHexagonDistance = Hexagon.Operations.distance({q:0, r:0, s:0}, nextHexagon)
                            if (drawn.has(nextHexagonId) || (input_Distance.checked && nextHexagonDistance > input_DistanceThreshold.value) || (input_Random.checked && Math.random() >= input_RandomThreshold.value)) {
                                continue;
                            } else {
                                drawn.add(nextHexagonId);
                            }
                            // Obtener coordenadas del hexagono
                            const coords     = Hexagon.Operations[input_Orientation.value].hexToCoords(nextHexagon, size)
                            const coordsDraw = { x: coords.x + canvasMapGrid.width/2, y: coords.y + canvasMapGrid.height/2 }
                            const coordsCont = { x: coords.x + contoursData.width/2, y: coords.y + contoursData.height/2 }
                            // Verificar si hay que dibujar o no el hexagono
                            let coordsInContours = false;
                            for (let i = 0; i < contoursData.contours.size(); i++) {
                                const contour = contoursData.contours.get(i);
                                if (cv.pointPolygonTest(contour, new cv.Point(coordsCont.x, coordsCont.y), false) >= 0) {
                                    coordsInContours = true;
                                    break;
                                }
                            }
                            // Dibujar el hexagono
                            if (coordsInContours) {
                                contextMapGrid.beginPath();
                                for (let i = 0; i < 6; i++) {
                                    const angle = Hexagon.Operations[input_Orientation.value].angle(i)
                                    contextMapGrid.lineTo(
                                        coordsDraw.x + size * Math.cos(angle),
                                        coordsDraw.y + size * Math.sin(angle)
                                    );
                                }
                                contextMapGrid.closePath();
                                contextMapGrid.fillStyle = "#C7F08B";
                                contextMapGrid.fill();
                                contextMapGrid.stroke();
                            }
                            // Agregar el siguiente hexagono 
                            if (coordsCont.x > 0 && coordsCont.x < contoursData.width && coordsCont.y > 0 && coordsCont.y < contoursData.height && !border.has(nextHexagonId) && !expand.has(nextHexagonId)) {
                                border.add(nextHexagonId)
                                bqueue.push(nextHexagonId)
                            }
                        }
                    }
                }
                // Mostrar el resultado
                cv.imshow('canvas_Contour', image)

                image.delete()
            }
        } 
        else if (file.type.startsWith("video/")) {
            // Iniciar opciones
            input_Distance.disabled = false;
            input_Distance.checked = false;
            input_DistanceThreshold.disabled = true;
            if (contoursData !== undefined) {
                contoursData.contours.delete();
                contoursData = undefined;
            }
            // Obtener video:
            const videoPlayer = document.getElementById('video_Player')
            videoPlayer.src   = URL.createObjectURL(file)
            videoPlayer.addEventListener('canplay', () => {
                // Iniciar canvases
                // - Preview
                canvasPreview.width = videoPlayer.videoWidth;
                canvasPreview.height = videoPlayer.videoHeight;
                // - Mapa generado
                const scaleFactor = 2
                canvasMapGrid.width = videoPlayer.videoWidth * scaleFactor;
                canvasMapGrid.height = videoPlayer.videoHeight * scaleFactor;
                contextMapGrid.scale(scaleFactor, scaleFactor)
                // Procesar frame
                const processFrame = () => {
                    if (videoPlayer.paused || videoPlayer.ended) {
                        return;
                    }
                    contextPreview.drawImage(videoPlayer, 0, 0, canvasPreview.width, canvasPreview.height);
                    // Cargar la imagen
                    const image  = cv.imread(canvasPreview);
                    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
                    // Convertir a escala de grises
                    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY)
                    // Expansión de la imagen agregando un borde (blanco o negro segun el fondo)
                    let borderColor    = new cv.Scalar(255, 255, 255)
                    let canvasFstColor = "#ffffff"
                    let canvasSndColor = "#000000"
                    if (cv.mean(image)[0] <= 127) {
                        borderColor    = new cv.Scalar(0, 0, 0)
                        canvasFstColor = "#000000"
                        canvasSndColor = "#ffffff"
                    }
                    cv.copyMakeBorder(image, image, 2, 2, 2, 2, cv.BORDER_CONSTANT, borderColor)
                    // Aplicar desenfoque para reducir ruido
                    cv.GaussianBlur(image, image, new cv.Size(5,5), 0)
                    // Aplicar detección de bordes con Canny
                    cv.Canny(image, image, 10, 50)
                    // Cerrar los contornos
                    cv.morphologyEx(image, image, cv.MORPH_CLOSE, kernel);
                    // Encontrar los contornos
                    const contours = new cv.MatVector();
                    const hierarchy = new cv.Mat();
                    cv.findContours(image, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
                    if (contours.size() > 0) {
                        // image = new cv.Mat(image.rows, image.cols, cv.CV_8UC3, new cv.Scalar(0, 0, 0));
                        // for (let i = 0; i < contours.size(); i++) {
                        //     let color = new cv.Scalar(Math.random() * 255, Math.random() * 255, Math.random() * 255);
                        //     cv.drawContours(image, contours, i, color, 1);
                        // }
                        // Limpiar canvas
                        contextMapGridParent.style.backgroundColor = canvasFstColor;
                        contextMapGrid.clearRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
                        contextMapGrid.fillStyle = canvasFstColor
                        contextMapGrid.fillRect(0, 0, canvasMapGrid.width, canvasMapGrid.height);
                        // Variables para la propagacion
                        const size   = (input_Size.checked) ? input_SizeThreshold.value : 15;
                        const bqueue = [ToString({q:0,r:0,s:0})]
                        const border = new Set(bqueue)
                        const expand = new Set()
                        const drawn  = new Set()
                        // Bucle de la propagacion
                        while (border.size > 0) {
                            // Obtener hexagono
                            let hexagon = bqueue.pop()
                            border.delete(hexagon)
                            expand.add(hexagon)
                            hexagon = ToHex(hexagon)
                            // Direcciones
                            for (const direction of Hexagon.Directions) {
                                const nextHexagon = { q:hexagon.q + direction.q, r:hexagon.r + direction.r, s:hexagon.s + direction.s };
                                const nextHexagonId = ToString(nextHexagon);
                                const nextHexagonDistance = Hexagon.Operations.distance({q:0, r:0, s:0}, nextHexagon)
                                if (drawn.has(nextHexagonId) || (input_Distance.checked && nextHexagonDistance > input_DistanceThreshold.value) || (input_Random.checked && Math.random() >= input_RandomThreshold.value)) {
                                    continue;
                                } else {
                                    drawn.add(nextHexagonId);
                                }
                                // Obtener coordenadas del hexagono
                                const coords     = Hexagon.Operations[input_Orientation.value].hexToCoords(nextHexagon, size)
                                const coordsDraw = { x: coords.x + canvasMapGrid.width/(2*scaleFactor), y: coords.y + canvasMapGrid.height/(2*scaleFactor) }
                                const coordsCont = { x: coords.x + image.cols/2, y: coords.y + image.rows/2 }
                                // Verificar si hay que dibujar o no el hexagono
                                let coordsInContours = false;
                                for (let i = 0; i < contours.size(); i++) {
                                    const contour = contours.get(i);
                                    if (cv.pointPolygonTest(contour, new cv.Point(coordsCont.x, coordsCont.y), false) >= 0) {
                                        coordsInContours = true;
                                        break;
                                    }
                                }
                                // Dibujar el hexagono
                                if (coordsInContours) {
                                    contextMapGrid.beginPath();
                                    for (let i = 0; i < 6; i++) {
                                        const angle = Hexagon.Operations[input_Orientation.value].angle(i)
                                        contextMapGrid.lineTo(
                                            coordsDraw.x + size * Math.cos(angle),
                                            coordsDraw.y + size * Math.sin(angle)
                                        );
                                    }
                                    contextMapGrid.closePath();
                                    contextMapGrid.fillStyle = canvasFstColor;
                                    contextMapGrid.fill();
                                    contextMapGrid.strokeStyle = canvasSndColor;
                                    contextMapGrid.stroke();
                                }
                                // Agregar el siguiente hexagono 
                                if (coordsCont.x > 0 && coordsCont.x < image.cols && coordsCont.y > 0 && coordsCont.y < image.rows && !border.has(nextHexagonId) && !expand.has(nextHexagonId)) {
                                    border.add(nextHexagonId)
                                    bqueue.push(nextHexagonId)
                                }
                            }
                        }
                    }
                    // Mostrar el resultado
                    cv.imshow('canvas_Contour', image)
                    // Limpiar la memoria
                    image.delete()
                    kernel.delete()
                    contours.delete()
                    // Siguiente frame
                    setTimeout(() => {
                        requestAnimationFrame(processFrame);
                    }, 50);
                }
                // Evento para procesar el frame tras reproducir el video
                videoPlayer.addEventListener('play', function () {
                    processFrame();
                });
                // Reproducir el video
                videoPlayer.play()
                // Reproducir el primer frame
                processFrame()
            })
        }
    }
})
const input_Download = document.getElementById("input_Download")
const input_Download_Link = document.getElementById("input_Download_Link")


// --------------------------------------
// Main
// --------------------------------------
window.addEventListener('resize', (event) => {
    if (file === undefined) {
        Generate["FROM_ZERO"]()
    } else if (file.type.startsWith("image/")) {
        Generate["FROM_FILE"](path)
    }
})
Generate["FROM_ZERO"]()