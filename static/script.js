const CONFIG = {
    CANVAS: {
        WIDTH: 400,
        HEIGHT: 400,
        SCALE: 40,
        AXIS_COLOR: '#34363d',
        REGION_COLOR: 'rgba(100, 149, 237, 0.5)',
        HIT_COLOR: 'green',
        MISS_COLOR: 'red',
        POINT_RADIUS: 5,
        MARK_LENGTH: 10,
        ARROW_SIZE: 10
    }, VALIDATION: {
        Y_MIN: -5, Y_MAX: 5, X_MIN: -2, X_MAX: 2, R_VALUES: [1, 1.5, 2, 2.5, 3]
    }, SELECTORS: {
        CANVAS: 'coordinatePlane',
        X_INPUT: 'xValue',
        Y_INPUT: 'yValue',
        FORM: 'pointForm',
        R_BUTTONS: '.r-button',
        RESULTS_TABLE: '#resultsTable tbody'
    }, API: {
        ENDPOINT: '/hitcheck', HEADERS: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, TEXT: {
        X_AXIS: 'X', Y_AXIS: 'Y', HIT_YES: 'Да', HIT_NO: 'Нет', VALIDATION: {
            NUMBER_REQUIRED: 'Y должно быть числом',
            RANGE_REQUIRED: 'Y должен быть строго в диапазоне (-5; 5)',
            FIELD_REQUIRED: 'Поле Y не может быть пустым',
            SERVER_ERROR: 'Ошибка сервера',
            INVALID_DATA: 'Некорректные данные. Проверьте ввод.'
        }
    }, TIMING: {
        TOOLTIP_SHOW: 10, TOOLTIP_HIDE: 3000, NOTIFICATION_DURATION: 4000, DEBOUNCE: 300
    }
};

const Utils = {
    roundToHalf: num => Math.round(num * 2) / 2,
    formatCoordinate: num => num.toFixed(2),
    isInRange: (value, min, max) => value > min && value < max,
    isInRangeInclusive: (value, min, max) => value >= min && value <= max,
    debounce: (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }
};

class CoordinatePlane {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        const {WIDTH, HEIGHT, SCALE} = CONFIG.CANVAS;
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.centerX = WIDTH / 2;
        this.centerY = HEIGHT / 2;
        this.scale = SCALE;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        const graphX = (clickX - this.centerX) / this.scale;
        const graphY = (this.centerY - clickY) / this.scale;

        this.updateFormFields(graphX, graphY);
    }

    updateFormFields(graphX, graphY) {
        const {X_MIN, X_MAX, Y_MIN, Y_MAX} = CONFIG.VALIDATION;
        const roundedX = Utils.roundToHalf(graphX);

        if (Utils.isInRangeInclusive(roundedX, X_MIN, X_MAX)) {
            document.getElementById(CONFIG.SELECTORS.X_INPUT).value = roundedX;
        }

        if (Utils.isInRange(graphY, Y_MIN, Y_MAX)) {
            document.getElementById(CONFIG.SELECTORS.Y_INPUT).value = Utils.formatCoordinate(graphY);
        }
    }

    drawAxes() {
        const {AXIS_COLOR} = CONFIG.CANVAS;
        this.ctx.strokeStyle = AXIS_COLOR;
        this.ctx.lineWidth = 2;

        this.drawLine(0, this.centerY, this.canvas.width, this.centerY);
        this.drawLine(this.centerX, 0, this.centerX, this.canvas.height);

        this.drawArrow(this.centerX, 0, 'up');
        this.drawArrow(this.canvas.width, this.centerY, 'right');
        this.drawAxisLabels();
        this.drawAxisMarks();
    }

    drawLine(startX, startY, endX, endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    drawAxisLabels() {
        this.ctx.fillStyle = CONFIG.CANVAS.AXIS_COLOR;
        this.ctx.font = '20px Arial';
        this.ctx.fillText(CONFIG.TEXT.X_AXIS, this.canvas.width - 20, this.centerY - 10);
        this.ctx.fillText(CONFIG.TEXT.Y_AXIS, this.centerX + 10, 20);
    }

    drawAxisMarks() {
        const {MARK_LENGTH} = CONFIG.CANVAS;
        const step = this.scale;

        for (let i = 0; i <= this.canvas.width; i += step) {
            this.drawMark(i, this.centerY, MARK_LENGTH, 'horizontal');
            this.drawMarkLabel(i, this.centerY, (i - this.centerX) / this.scale, 'x');
        }

        for (let i = 0; i <= this.canvas.height; i += step) {
            this.drawMark(this.centerX, i, MARK_LENGTH, 'vertical');
            this.drawMarkLabel(this.centerX, i, (this.centerY - i) / this.scale, 'y');
        }
    }

    drawMark(x, y, length, orientation) {
        this.ctx.beginPath();

        if (orientation === 'horizontal') {
            this.ctx.moveTo(x, y - length / 2);
            this.ctx.lineTo(x, y + length / 2);
        } else {
            this.ctx.moveTo(x - length / 2, y);
            this.ctx.lineTo(x + length / 2, y);
        }

        this.ctx.stroke();
    }

    drawMarkLabel(x, y, value, axis) {
        if ((axis === 'x' && x !== this.centerX) || (axis === 'y' && y !== this.centerY)) {
            if (Math.abs(value) % 0.5 === 0) {
                const labelX = axis === 'x' ? x : this.centerX + 15;
                const labelY = axis === 'x' ? this.centerY + 20 : y;
                this.ctx.fillText(value.toFixed(1), labelX, labelY);
            }
        }
    }

    drawArrow(x, y, direction) {
        const {ARROW_SIZE, AXIS_COLOR} = CONFIG.CANVAS;
        this.ctx.fillStyle = AXIS_COLOR;
        this.ctx.beginPath();

        if (direction === 'right') {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - ARROW_SIZE, y - ARROW_SIZE / 2);
            this.ctx.lineTo(x - ARROW_SIZE, y + ARROW_SIZE / 2);
        } else if (direction === 'up') {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - ARROW_SIZE / 2, y + ARROW_SIZE);
            this.ctx.lineTo(x + ARROW_SIZE / 2, y + ARROW_SIZE);
        }

        this.ctx.fill();
    }

    drawRegion(r) {
        const {REGION_COLOR} = CONFIG.CANVAS;
        this.ctx.fillStyle = REGION_COLOR;

        this.drawTriangle(r);
        this.drawRectangle(r);
        this.drawQuarterCircle(r);
    }

    drawTriangle(r) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(this.centerX + (r * this.scale / 2), this.centerY);
        this.ctx.lineTo(this.centerX, this.centerY - (r * this.scale / 2));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawRectangle(r) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(this.centerX - r * this.scale, this.centerY);
        this.ctx.lineTo(this.centerX - r * this.scale, this.centerY - (r * this.scale / 2));
        this.ctx.lineTo(this.centerX, this.centerY - (r * this.scale / 2));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawQuarterCircle(r) {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, r * this.scale, Math.PI * 0.5, Math.PI);
        this.ctx.lineTo(this.centerX, this.centerY);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawPoint(x, y, hit) {
        const {HIT_COLOR, MISS_COLOR, POINT_RADIUS} = CONFIG.CANVAS;
        this.ctx.fillStyle = hit ? HIT_COLOR : MISS_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX + x * this.scale, this.centerY - y * this.scale, POINT_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
    }

    init(r, results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawAxes();
        this.drawRegion(r);
        this.drawHistoryPoints(r, results);
    }

    drawHistoryPoints(r, results) {
        results.forEach(result => {
            if (result.r === r) {
                this.drawPoint(result.x, result.y, result.hit);
            }
        });
    }
}

class FormValidator {
    constructor() {
        this.yInput = document.getElementById(CONFIG.SELECTORS.Y_INPUT);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const debouncedHandler = Utils.debounce(this.handleYInput.bind(this), CONFIG.TIMING.DEBOUNCE);
        this.yInput.addEventListener('input', debouncedHandler);
        this.yInput.addEventListener('blur', this.handleYInput.bind(this));

        document.getElementById(CONFIG.SELECTORS.FORM)
            .addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleYInput(event) {
        const value = event.target.value.trim();
        const inputContainer = this.yInput.closest('.input-container');

        this.removeExistingTooltip(inputContainer);

        if (value === '') {
            this.yInput.classList.remove('input-error');
            return;
        }

        if (!this.isValidNumber(value)) {
            this.showError(inputContainer, CONFIG.TEXT.VALIDATION.NUMBER_REQUIRED);
            return;
        }

        const num = parseFloat(value);
        if (!Utils.isInRange(num, CONFIG.VALIDATION.Y_MIN, CONFIG.VALIDATION.Y_MAX)) {
            this.showError(inputContainer, CONFIG.TEXT.VALIDATION.RANGE_REQUIRED);
        } else {
            this.yInput.classList.remove('input-error');
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        const yValue = this.yInput.value.trim();
        const xValue = document.getElementById(CONFIG.SELECTORS.X_INPUT).value;
        const selectedR = document.querySelector(`${CONFIG.SELECTORS.R_BUTTONS}.selected`).value;
        const inputContainer = this.yInput.closest('.input-container');

        this.removeExistingTooltip(inputContainer);

        if (!this.validateY(yValue, inputContainer)) {
            return false;
        }

        return {
            x: xValue, y: parseFloat(yValue), r: selectedR
        };
    }

    validateY(yValue, inputContainer) {
        if (yValue === '') {
            this.showError(inputContainer, CONFIG.TEXT.VALIDATION.FIELD_REQUIRED);
            return false;
        }

        if (!this.isValidNumber(yValue)) {
            this.showError(inputContainer, CONFIG.TEXT.VALIDATION.NUMBER_REQUIRED);
            return false;
        }

        const num = parseFloat(yValue);
        if (!Utils.isInRange(num, CONFIG.VALIDATION.Y_MIN, CONFIG.VALIDATION.Y_MAX)) {
            this.showError(inputContainer, CONFIG.TEXT.VALIDATION.RANGE_REQUIRED);
            return false;
        }

        return true;
    }

    isValidNumber(value) {
        return /^-?\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value));
    }

    showError(container, message) {
        this.yInput.classList.add('input-error');
        this.createTooltip(container, message);
    }

    removeExistingTooltip(container) {
        const existingTooltip = container.querySelector('.input-tooltip');
        if (existingTooltip) existingTooltip.remove();
    }

    createTooltip(container, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'input-tooltip';
        tooltip.textContent = message;
        container.appendChild(tooltip);

        setTimeout(() => tooltip.classList.add('show'), CONFIG.TIMING.TOOLTIP_SHOW);
        setTimeout(() => this.removeTooltip(tooltip), CONFIG.TIMING.TOOLTIP_HIDE);
    }

    removeTooltip(tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }
}

class ApiClient {
    static async sendData(x, y, r) {
        document.getElementById(CONFIG.SELECTORS.Y_INPUT).classList.remove('input-error');

        const params = new URLSearchParams();
        params.append('x', x);
        params.append('y', y);
        params.append('r', r);

        try {
            const response = await fetch(CONFIG.API.ENDPOINT, {
                method: 'POST', headers: CONFIG.API.HEADERS, body: params
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            NotificationManager.showServerNotification(error.message);
            throw error;
        }
    }

    static async handleResponse(response) {
        if (response.status === 400) {
            throw new Error(CONFIG.TEXT.VALIDATION.INVALID_DATA);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            throw new Error(CONFIG.TEXT.VALIDATION.SERVER_ERROR);
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || CONFIG.TEXT.VALIDATION.SERVER_ERROR);
        }

        return await response.json();
    }
}

class NotificationManager {
    static showServerNotification(message, duration = CONFIG.TIMING.NOTIFICATION_DURATION) {
        const existing = document.querySelector('.server-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'server-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), CONFIG.TIMING.TOOLTIP_SHOW);
        setTimeout(() => this.removeNotification(notification), duration);
    }

    static removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

class TableRenderer {
    static formatExecTime(timeNanos) {
        if (timeNanos < 1000) {
            return `${timeNanos} ns`;
        } else if (timeNanos < 1_000_000) {
            return `${(timeNanos / 1000).toFixed(1)} µs`;
        } else {
            return `${(timeNanos / 1_000_000).toFixed(1)} nano`;
        }
    }

    static getExecTimeClass(timeNanos) {
        if (timeNanos < 10_000) return 'exec-fast';
        if (timeNanos < 100_000) return 'exec-medium';
        return 'exec-slow';
    }

    static addResultToTable(result) {
        const tableBody = document.querySelector(CONFIG.SELECTORS.RESULTS_TABLE);
        this.clearNoResultsMessage(tableBody);
        tableBody.appendChild(this.createTableRow(result));
    }

    static clearNoResultsMessage(tableBody) {
        const noResultsRow = tableBody.querySelector('td[colspan="6"]');
        if (noResultsRow) tableBody.innerHTML = '';
    }

    static createTableRow(result) {
        const execTimeFormatted = this.formatExecTime(result.execTimeNanos);
        const execTimeClass = this.getExecTimeClass(result.execTimeNanos);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.x}</td>
            <td>${result.y}</td>
            <td>${result.r}</td>
            <td class="${result.hit ? 'hit-yes' : 'hit-no'}">
                ${result.hit ? CONFIG.TEXT.HIT_YES : CONFIG.TEXT.HIT_NO}
            </td>
            <td>${new Date(result.timestamp).toLocaleString()}</td>
            <td class="exec-time ${execTimeClass}">${execTimeFormatted}</td>
        `;
        return row;
    }
}

class App {
    constructor() {
        this.results = [];
        this.coordinatePlane = new CoordinatePlane(CONFIG.SELECTORS.CANVAS);
        this.formValidator = new FormValidator();
        this.setupRButtons();
        this.init();
    }

    setupRButtons() {
        document.querySelectorAll(CONFIG.SELECTORS.R_BUTTONS).forEach(button => {
            button.addEventListener('click', () => {
                this.selectRButton(button);
                this.coordinatePlane.init(parseFloat(button.value), this.results);
            });
        });
    }

    selectRButton(button) {
        document.querySelectorAll(CONFIG.SELECTORS.R_BUTTONS)
            .forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    }

    init() {
        const initialR = CONFIG.VALIDATION.R_VALUES[0];
        document.querySelector(`${CONFIG.SELECTORS.R_BUTTONS}[value="${initialR}"]`)
            .classList.add('selected');
        this.coordinatePlane.init(initialR, this.results);
    }

    async submitForm() {
        const validationResult = this.formValidator.handleSubmit(new Event('submit'));
        if (!validationResult) return;

        try {
            const {x, y, r} = validationResult;
            const data = await ApiClient.sendData(x, y, parseFloat(r));

            this.results = data;
            TableRenderer.addResultToTable(data[data.length - 1]);
            this.coordinatePlane.init(parseFloat(r), this.results);
            this.coordinatePlane.drawPoint(x, y, data[data.length - 1].hit);
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    document.getElementById(CONFIG.SELECTORS.FORM)
        .addEventListener('submit', (event) => {
            event.preventDefault();
            app.submitForm();
        });
});