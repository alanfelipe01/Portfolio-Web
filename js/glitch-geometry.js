// Cálculos sem acesso ao DOM para manter o percurso separado da animação.
(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        root.GlitchGeometry = factory();
    }
})(globalThis, () => {
    function overlaps(a, b, margin) {
        return a.left < b.right + margin && a.right > b.left - margin &&
            a.top < b.bottom + margin && a.bottom > b.top - margin;
    }

    function rectangleAt(position, size) {
        return {
            left: position.x,
            top: position.y,
            right: position.x + size.width,
            bottom: position.y + size.height
        };
    }

    function rectangleIsFree(rectangle, bounds, obstacles, margin = 6) {
        if (rectangle.left < bounds.left || rectangle.top < bounds.top ||
            rectangle.right > bounds.right || rectangle.bottom > bounds.bottom) return false;
        return !obstacles.some(obstacle => overlaps(rectangle, obstacle, margin));
    }

    function positionIsFree(position, size, bounds, obstacles, margin = 6) {
        return rectangleIsFree(rectangleAt(position, size), bounds, obstacles, margin);
    }

    function pathIsFree(from, to, size, bounds, obstacles, margin = 6) {
        const swept = {
            left: Math.min(from.x, to.x),
            top: Math.min(from.y, to.y),
            right: Math.max(from.x, to.x) + size.width,
            bottom: Math.max(from.y, to.y) + size.height
        };
        return rectangleIsFree(swept, bounds, obstacles, margin);
    }

    function axisValues(max, min, step) {
        const values = [];
        for (let value = max; value >= min; value -= step) values.push(value);
        if (values.length && values[values.length - 1] !== min) values.push(min);
        return values;
    }

    function findFreePosition(size, bounds, obstacles, step = 24, margin = 6) {
        const right = bounds.right - size.width;
        const bottom = bounds.bottom - size.height;
        if (right < bounds.left || bottom < bounds.top) return null;

        const columns = axisValues(right, bounds.left, step);
        const rows = axisValues(bottom, bounds.top, step);
        for (const y of rows) {
            for (const x of columns) {
                const position = { x, y };
                if (positionIsFree(position, size, bounds, obstacles, margin)) return position;
            }
        }
        return null;
    }

    function findNearestFreePosition(from, size, bounds, obstacles, step = 24, margin = 6) {
        const right = bounds.right - size.width;
        const bottom = bounds.bottom - size.height;
        if (right < bounds.left || bottom < bounds.top) return null;

        const x = Math.max(bounds.left, Math.min(right, from.x));
        const y = Math.max(bounds.top, Math.min(bottom, from.y));
        const columns = [x, ...axisValues(right, bounds.left, step)];
        const rows = [y, ...axisValues(bottom, bounds.top, step)];
        let nearest = null;
        let nearestDistance = Infinity;
        for (const row of rows) {
            for (const column of columns) {
                const candidate = { x: column, y: row };
                const distance = (column - from.x) ** 2 + (row - from.y) ** 2;
                if (distance >= nearestDistance ||
                    !positionIsFree(candidate, size, bounds, obstacles, margin)) continue;
                nearest = candidate;
                nearestDistance = distance;
            }
        }
        return nearest;
    }

    function chooseDestination(from, size, bounds, obstacles, options, random = Math.random) {
        const direction = random() < .5 ? -1 : 1;
        const distance = options.minDistance + random() * (options.maxDistance - options.minDistance);
        const minimumClearance = options.minimumClearance ?? options.minDistance;
        let fallback = null;

        for (const side of [direction, -direction]) {
            const available = side < 0 ? from.x - bounds.left : bounds.right - size.width - from.x;
            const limit = Math.min(distance, available);
            if (limit < minimumClearance) continue;

            const atDistance = length => ({ x: from.x + side * length, y: from.y });
            let safeDistance = limit;
            if (!pathIsFree(from, atDistance(limit), size, bounds, obstacles, options.margin)) {
                let low = 0;
                let high = limit;
                // O caminho livre é contínuo a partir da posição atual; procuramos
                // o maior trecho seguro sem atravessar o obstáculo.
                for (let attempt = 0; attempt < 16; attempt++) {
                    const middle = (low + high) / 2;
                    if (pathIsFree(from, atDistance(middle), size, bounds, obstacles, options.margin)) low = middle;
                    else high = middle;
                }
                safeDistance = low;
            }
            if (safeDistance < minimumClearance) continue;
            const to = atDistance(safeDistance);
            if (safeDistance >= options.minDistance) return to;
            if (!fallback || safeDistance > fallback.distance) fallback = { position: to, distance: safeDistance };
        }
        return fallback ? fallback.position : null;
    }

    return { positionIsFree, pathIsFree, findFreePosition, findNearestFreePosition, chooseDestination };
});
