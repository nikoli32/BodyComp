const canvas = document.querySelector("#muscleCanvas");
const ctx = canvas.getContext("2d");
const resetView = document.querySelector("#resetView");
const muscleName = document.querySelector("#muscleName");
const detailTitle = document.querySelector("#detailTitle");
const muscleDescription = document.querySelector("#muscleDescription");
const muscleList = document.querySelector("#muscleList");
const visibleSide = document.querySelector("#visibleSide");
const totalGroups = document.querySelector("#totalGroups");
const frontView = document.querySelector("#frontView");
const backView = document.querySelector("#backView");

const design = { width: 520, height: 770 };
const basePalette = {
  body: "#2b3445",
  bodyStroke: "#111722",
  muscle: "#2f7fca",
  muscleDeep: "#235c98",
  muscleLight: "#45a4ed",
  inactive: "#3b4051",
  line: "rgba(10, 14, 21, 0.68)",
  hover: "#55b7ff",
  hoverStroke: "#ccecff",
};

const muscles = [
  muscle("Deltoids", "Shoulder abduction and pressing control.", ["leftDeltoid", "rightDeltoid"]),
  muscle("Pectorals", "Primary chest muscles for pressing and shoulder flexion.", ["leftPec", "rightPec"]),
  muscle("Biceps", "Front upper-arm flexors used in curls, rows, and pulling work.", ["leftBiceps", "rightBiceps"]),
  muscle("Forearms", "Grip and wrist control muscles used in carries, curls, and pulling.", ["leftForearm", "rightForearm"]),
  muscle("Rectus Abdominis", "Central abdominal wall used for trunk flexion and bracing.", ["leftUpperAbs", "rightUpperAbs", "leftMidAbs", "rightMidAbs", "leftLowerAbs", "rightLowerAbs"]),
  muscle("Obliques", "Side abdominal muscles that rotate, bend, and stabilize the trunk.", ["leftOblique", "rightOblique"]),
  muscle("Hip Flexors", "Anterior hip muscles involved in knee drive and leg raises.", ["leftHipFlexor", "rightHipFlexor"]),
  muscle("Adductors", "Inner thigh muscles that draw the legs inward and support squats.", ["leftAdductor", "rightAdductor"]),
  muscle("Quadriceps", "Front thigh muscles used for knee extension, squats, lunges, and jumping.", ["leftQuadOuter", "leftQuadInner", "rightQuadOuter", "rightQuadInner"]),
  muscle("Tibialis Anterior", "Front shin muscles that lift the foot and support deceleration.", ["leftShin", "rightShin"]),
  muscle("Calves", "Lower-leg muscles for ankle extension, running, jumping, and lower-leg stability.", ["leftCalf", "rightCalf"]),
];

const regionBuilders = {
  silhouette: () => path([
    ["M", 250, 77], ["C", 227, 84, 217, 105, 221, 127],
    ["L", 228, 158], ["L", 195, 184], ["L", 164, 224],
    ["L", 136, 281], ["L", 113, 365], ["L", 94, 398],
    ["L", 118, 412], ["L", 148, 382], ["L", 166, 308],
    ["L", 184, 254], ["L", 200, 327], ["L", 209, 410],
    ["L", 188, 496], ["L", 174, 616], ["L", 159, 719],
    ["L", 199, 724], ["L", 225, 562], ["L", 259, 458],
    ["L", 293, 562], ["L", 319, 724], ["L", 361, 719],
    ["L", 346, 616], ["L", 332, 496], ["L", 309, 410],
    ["L", 318, 327], ["L", 336, 254], ["L", 358, 308],
    ["L", 372, 382], ["L", 402, 412], ["L", 421, 396],
    ["L", 407, 365], ["L", 384, 281], ["L", 356, 224],
    ["L", 325, 184], ["L", 292, 158], ["L", 299, 127],
    ["C", 303, 105, 293, 84, 270, 77], ["Z"],
  ]),
  head: () => path([["M", 260, 45], ["C", 229, 45, 212, 69, 216, 99], ["C", 220, 130, 238, 150, 260, 150], ["C", 282, 150, 300, 130, 304, 99], ["C", 308, 69, 291, 45, 260, 45], ["Z"]]),
  neck: () => path([["M", 235, 148], ["L", 285, 148], ["L", 298, 184], ["L", 260, 209], ["L", 222, 184], ["Z"]]),
  leftHand: () => path([["M", 99, 473], ["C", 81, 486, 74, 506, 83, 520], ["L", 114, 507], ["C", 118, 493, 113, 480, 99, 473], ["Z"]]),
  rightHand: () => mirror(regionBuilders.leftHand()),
  leftFoot: () => path([["M", 160, 718], ["C", 143, 728, 133, 741, 134, 754], ["L", 199, 754], ["C", 204, 740, 195, 726, 181, 721], ["Z"]]),
  rightFoot: () => mirror(regionBuilders.leftFoot()),
  leftDeltoid: () => path([["M", 188, 188], ["C", 150, 197, 130, 221, 124, 259], ["C", 153, 272, 180, 264, 198, 239], ["C", 208, 218, 205, 199, 188, 188], ["Z"]]),
  rightDeltoid: () => mirror(regionBuilders.leftDeltoid()),
  leftPec: () => path([["M", 226, 203], ["C", 188, 204, 164, 224, 160, 258], ["C", 174, 285, 204, 296, 250, 286], ["L", 252, 218], ["C", 246, 209, 238, 204, 226, 203], ["Z"]]),
  rightPec: () => mirror(regionBuilders.leftPec()),
  leftBiceps: () => path([["M", 143, 265], ["C", 122, 287, 118, 329, 130, 361], ["C", 152, 353, 165, 319, 163, 285], ["C", 159, 272, 153, 266, 143, 265], ["Z"]]),
  rightBiceps: () => mirror(regionBuilders.leftBiceps()),
  leftForearm: () => path([["M", 126, 354], ["C", 106, 386, 96, 437, 102, 481], ["C", 129, 462, 145, 414, 146, 372], ["C", 141, 361, 134, 355, 126, 354], ["Z"]]),
  rightForearm: () => mirror(regionBuilders.leftForearm()),
  leftUpperAbs: () => path([["M", 232, 300], ["L", 258, 300], ["L", 258, 342], ["C", 249, 348, 239, 346, 234, 338], ["Z"]]),
  rightUpperAbs: () => mirror(regionBuilders.leftUpperAbs()),
  leftMidAbs: () => path([["M", 235, 350], ["C", 242, 356, 251, 358, 258, 355], ["L", 258, 402], ["C", 250, 408, 241, 407, 237, 399], ["Z"]]),
  rightMidAbs: () => mirror(regionBuilders.leftMidAbs()),
  leftLowerAbs: () => path([["M", 238, 410], ["C", 244, 417, 252, 420, 258, 416], ["L", 258, 478], ["L", 245, 462], ["Z"]]),
  rightLowerAbs: () => mirror(regionBuilders.leftLowerAbs()),
  leftOblique: () => path([["M", 205, 287], ["L", 232, 304], ["L", 236, 407], ["L", 216, 454], ["C", 199, 415, 192, 352, 205, 287], ["Z"]]),
  rightOblique: () => mirror(regionBuilders.leftOblique()),
  leftHipFlexor: () => path([["M", 216, 452], ["L", 250, 484], ["L", 226, 532], ["L", 199, 494], ["Z"]]),
  rightHipFlexor: () => mirror(regionBuilders.leftHipFlexor()),
  leftAdductor: () => path([["M", 226, 520], ["L", 255, 486], ["L", 250, 604], ["C", 231, 586, 220, 556, 226, 520], ["Z"]]),
  rightAdductor: () => mirror(regionBuilders.leftAdductor()),
  leftQuadOuter: () => path([["M", 198, 486], ["C", 170, 536, 164, 604, 180, 652], ["C", 210, 616, 225, 556, 220, 506], ["Z"]]),
  rightQuadOuter: () => mirror(regionBuilders.leftQuadOuter()),
  leftQuadInner: () => path([["M", 224, 506], ["C", 224, 556, 211, 614, 184, 660], ["L", 230, 660], ["C", 252, 614, 258, 552, 250, 486], ["Z"]]),
  rightQuadInner: () => mirror(regionBuilders.leftQuadInner()),
  leftShin: () => path([["M", 194, 646], ["L", 224, 646], ["L", 216, 722], ["C", 202, 727, 188, 718, 181, 700], ["Z"]]),
  rightShin: () => mirror(regionBuilders.leftShin()),
  leftCalf: () => path([["M", 172, 632], ["C", 151, 666, 151, 706, 166, 728], ["C", 188, 722, 199, 682, 194, 646], ["C", 189, 635, 181, 631, 172, 632], ["Z"]]),
  rightCalf: () => mirror(regionBuilders.leftCalf()),
};

const state = {
  hovered: null,
  selected: null,
  pointer: { x: 0, y: 0 },
  zoom: 1,
  targetZoom: 1,
  offsetX: 0,
  offsetY: 0,
  targetOffsetX: 0,
  targetOffsetY: 0,
};

let scene = null;
let renderRegions = [];
let animationFrame = null;

init();

function init() {
  totalGroups.textContent = muscles.length;
  visibleSide.textContent = "Front view";
  renderMuscleList();
  bindEvents();
  resizeCanvas();
  animate();
}

function muscle(name, description, regions) {
  return {
    id: name.toLowerCase().replaceAll(" ", "-"),
    name,
    description,
    regions,
  };
}

function bindEvents() {
  window.addEventListener("resize", resizeCanvas);
  resetView.addEventListener("click", resetSelection);
  frontView.addEventListener("click", resetSelection);
  backView.addEventListener("click", () => {});

  canvas.addEventListener("pointermove", (event) => {
    updatePointer(event);
    updateHover();
  });

  canvas.addEventListener("pointerleave", () => {
    state.hovered = null;
  });

  canvas.addEventListener("click", () => {
    if (state.hovered) {
      selectMuscle(state.hovered);
    }
  });
}

function renderMuscleList() {
  muscleList.innerHTML = "";

  muscles.forEach((item) => {
    const button = document.createElement("button");
    button.className = "muscle-chip";
    button.type = "button";
    button.textContent = item.name;
    button.addEventListener("click", () => selectMuscle(item));
    muscleList.append(button);
  });
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function animate() {
  state.zoom += (state.targetZoom - state.zoom) * 0.12;
  state.offsetX += (state.targetOffsetX - state.offsetX) * 0.12;
  state.offsetY += (state.targetOffsetY - state.offsetY) * 0.12;
  draw();
  animationFrame = requestAnimationFrame(animate);
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  scene = getScene(width, height);
  renderRegions = buildRenderRegions();

  ctx.save();
  ctx.translate(scene.x, scene.y);
  ctx.scale(scene.scale, scene.scale);
  drawBodyBase();
  drawMuscleRegions();
  drawAnatomyLines();
  ctx.restore();

  canvas.style.cursor = state.hovered ? "pointer" : "default";
}

function getScene(width, height) {
  const baseScale = Math.min(width / design.width, height / design.height) * 0.96;
  const scale = baseScale * state.zoom;
  return {
    scale,
    x: width / 2 - (design.width * scale) / 2 + state.offsetX,
    y: height / 2 - (design.height * scale) / 2 + state.offsetY,
  };
}

function buildRenderRegions() {
  return muscles.flatMap((item) => item.regions.map((regionId) => ({
    muscle: item,
    id: regionId,
    path: regionBuilders[regionId](),
  })));
}

function drawBodyBase() {
  fillPath(regionBuilders.silhouette(), basePalette.body, basePalette.bodyStroke, 2.4);
  fillPath(regionBuilders.head(), "#34394a", "#151a24", 2);
  fillPath(regionBuilders.neck(), "#394052", "#151a24", 1.6);
  fillPath(regionBuilders.leftHand(), "#34394a", "#151a24", 1.6);
  fillPath(regionBuilders.rightHand(), "#34394a", "#151a24", 1.6);
  fillPath(regionBuilders.leftFoot(), "#34394a", "#151a24", 1.6);
  fillPath(regionBuilders.rightFoot(), "#34394a", "#151a24", 1.6);
}

function drawMuscleRegions() {
  renderRegions.forEach((region) => {
    const active = state.hovered?.id === region.muscle.id || state.selected?.id === region.muscle.id;
    const fill = active ? basePalette.hover : muscleFill(region.id);
    const stroke = active ? basePalette.hoverStroke : basePalette.line;
    fillPath(region.path, fill, stroke, active ? 2.6 : 1.4);
    drawFiber(region.path, active);
  });
}

function drawAnatomyLines() {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(260, 210);
  ctx.lineTo(260, 493);
  ctx.moveTo(206, 286);
  ctx.quadraticCurveTo(260, 306, 314, 286);
  ctx.moveTo(210, 466);
  ctx.quadraticCurveTo(260, 498, 310, 466);
  ctx.stroke();
  ctx.restore();
}

function fillPath(itemPath, fill, stroke, lineWidth) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.fill(itemPath.path);
  ctx.stroke(itemPath.path);
  ctx.restore();
}

function drawFiber(itemPath, active) {
  const bounds = pathBounds(itemPath.commands);
  ctx.save();
  ctx.clip(itemPath.path);
  ctx.globalAlpha = active ? 0.26 : 0.18;
  ctx.strokeStyle = active ? "#e5f6ff" : "#b9ddff";
  ctx.lineWidth = 1;

  for (let y = bounds.minY + 10; y < bounds.maxY; y += 18) {
    ctx.beginPath();
    ctx.moveTo(bounds.minX + 8, y);
    ctx.lineTo(bounds.maxX - 8, y + 8);
    ctx.stroke();
  }

  ctx.restore();
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  state.pointer.x = event.clientX - rect.left;
  state.pointer.y = event.clientY - rect.top;
}

function updateHover() {
  if (!scene) {
    return;
  }

  const localX = (state.pointer.x - scene.x) / scene.scale;
  const localY = (state.pointer.y - scene.y) / scene.scale;
  state.hovered = findHitRegion(localX, localY)?.muscle || null;
}

function findHitRegion(localX, localY) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const hit = [...renderRegions].reverse().find((region) => (
    ctx.isPointInPath(region.path.path, localX, localY)
  ));
  ctx.restore();
  return hit;
}

function selectMuscle(item) {
  state.selected = item;
  muscleName.textContent = item.name;
  detailTitle.textContent = item.name;
  muscleDescription.textContent = item.description;

  document.querySelectorAll(".muscle-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.textContent === item.name);
  });

  const bounds = muscleBounds(item);
  state.targetZoom = 1.42;
  state.targetOffsetX = canvas.clientWidth / 2 - (scene.x + ((bounds.minX + bounds.maxX) / 2) * scene.scale);
  state.targetOffsetY = canvas.clientHeight / 2 - (scene.y + ((bounds.minY + bounds.maxY) / 2) * scene.scale);
}

function resetSelection() {
  state.selected = null;
  state.hovered = null;
  state.targetZoom = 1;
  state.targetOffsetX = 0;
  state.targetOffsetY = 0;
  muscleName.textContent = "Full Body";
  detailTitle.textContent = "Full Body";
  muscleDescription.textContent = "Hover over a muscle group to highlight it. Click a region to focus the view and inspect that group.";
  document.querySelectorAll(".muscle-chip").forEach((chip) => chip.classList.remove("active"));
}

function muscleBounds(item) {
  return item.regions
    .map((regionId) => pathBounds(regionBuilders[regionId]().commands))
    .reduce((acc, bounds) => ({
      minX: Math.min(acc.minX, bounds.minX),
      minY: Math.min(acc.minY, bounds.minY),
      maxX: Math.max(acc.maxX, bounds.maxX),
      maxY: Math.max(acc.maxY, bounds.maxY),
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}

function path(commands) {
  const itemPath = new Path2D();
  commands.forEach((command) => {
    const [type, ...values] = command;
    if (type === "M") itemPath.moveTo(values[0], values[1]);
    if (type === "L") itemPath.lineTo(values[0], values[1]);
    if (type === "C") itemPath.bezierCurveTo(values[0], values[1], values[2], values[3], values[4], values[5]);
    if (type === "Q") itemPath.quadraticCurveTo(values[0], values[1], values[2], values[3]);
    if (type === "Z") itemPath.closePath();
  });
  return { path: itemPath, commands };
}

function mirror(itemPath) {
  const mirrored = itemPath.commands.map(([type, ...values]) => {
    const next = values.map((value, index) => index % 2 === 0 ? design.width - value : value);
    return [type, ...next];
  });
  return path(mirrored);
}

function pathBounds(commands) {
  const points = commands.flatMap(([type, ...values]) => {
    if (type === "Z") return [];
    const pointsOnly = [];
    for (let index = 0; index < values.length; index += 2) {
      pointsOnly.push({ x: values[index], y: values[index + 1] });
    }
    return pointsOnly;
  });

  return {
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

function muscleFill(regionId) {
  if (regionId.includes("Adductor") || regionId.includes("Oblique")) {
    return basePalette.muscleDeep;
  }
  if (regionId.includes("Shin") || regionId.includes("Forearm") || regionId.includes("Calf")) {
    return basePalette.muscleLight;
  }
  return basePalette.muscle;
}

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
});
