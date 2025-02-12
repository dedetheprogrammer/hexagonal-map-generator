# Hexagonal map generator
A hexagonal map generator made with OpenCV 4.x and JavaScript available from browser.

## Hexagonal map and parameters

You can generate a simple hexagonal map with different parameters that make the map generation more interesting:

- **Orientation**: The orientation of the hexagons, either _Flat top_ or _Pointy top_.
- **Distance**: The maximum Manhattan distance from the center.
- **Size**: The size of the hexagons in the given unit.
- **Random Walk**: Probability of movement—lower values increase randomness.
- **Media**: I'll save this for the next section.

![hexagonal_map_generator_1](https://github.com/user-attachments/assets/dfc21001-73f9-4392-babb-f680dbc1e93d)

## Hexagonal map generation with a drawing or an outline.

If you're bored of generating simple hexagonal maps, you can also draw your own outline or download one from the internet and upload it.

This is where OpenCV comes in—with a bit of magic, it detects the contours of your image and generates the map only within those boundaries. The parameters will also affect the final result.

![hexagonal_map_generator_2](https://github.com/user-attachments/assets/bfe6ba2c-c545-4f60-94b4-4b4a18a12e76)

## Hexagonal map generation with a video

If you're **really** bored, you can simply provide a video and watch the visual effects this generator creates. The parameters will affect the result in real-time, but you won't be able to save the output.

![hexagonal_map_generator_3](https://github.com/user-attachments/assets/d74769b9-9e41-486f-84f2-3a4b10839bf4)

## Missing features
- [ ] Save the result as a JSON file.
- [ ] Detect and consider internal contours (e.g., representing holes).
- [ ] Save the result as an image.
- [ ] Save the result as a video.
- [ ] Improve responsiveness.
- [ ] Port the project to other languages:
  - [ ] Python.
  - [ ] C++ (could make a plug-in to use it in Unity and Godot).
