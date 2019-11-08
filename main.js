
var Lagrange = function (x1, y1, x2, y2) {
	this.xs = [x1, x2];
	this.ys = [y1, y2];
}

function gdc(a, b) {
	if (b == 0)
		return a
	else
		return gdc(b, a % b)
}

function ldc(a, b) {
	Math.abs(a * b) / gdc(a, b);
}

Lagrange.prototype.adicionarPonto = function (x, y) {
	this.xs.push(x);
	this.ys.push(y);
	return this.quantidadePontos() - 1;
}

Lagrange.prototype.removerPonto = function (index) {
	this.xs.remove(index);
	this.ys.remove(index);
	return this.quantidadePontos();
};

Lagrange.prototype.quantidadePontos = function () {
	return this.xs.length;
};

Lagrange.prototype.plotValoresX = function () {
	min = this.xs[0];
	max = this.xs[0];
	step = this.xs[0];
	MAX_STEPS = 50;

	for (var i = 1; i < this.quantidadePontos(); i++) {
		step = Math.abs(gdc(this.xs[i], step));
		if (this.xs[i] < min) {
			min = this.xs[i];
		}
		if (this.xs[i] > max) {
			max = this.xs[i];
		}
	}

	min -= step * 2;
	max += step * 2;

	if ((max - min) / step > MAX_STEPS) {
		step = (max - min) / MAX_STEPS;
	}

	return math.range(min, max, step).toArray();
}

Lagrange.prototype.gerarExpressao = function (index) {
	var numerator = "", denominator = "";

	for (var j = 0; j < this.quantidadePontos(); j++) {
		if (index != j) {
			numerator += `(x - ${this.xs[j]}) *`;
			denominator += `(${this.xs[index]} - ${this.xs[j]}) *`;
		}
	}
	return `(${numerator.substr(0, numerator.length - 1)})/ (${denominator.substr(0, denominator.length - 1)})`;
};

Lagrange.prototype.generatePexpression = function () {
	var expression = "";
	for (var i = 0; i < this.quantidadePontos(); i++) {
		expression += `(${this.gerarExpressao(i)} * ${(this.ys[i])}) +`;
	}
	return expression.substr(0, expression.length - 1);
};

Lagrange.prototype.evaluateExpression = function (x) {
	var compiled = math.compile(this.generatePexpression());
	var scope = { x: x };
	return compiled.eval(scope);
}

Lagrange.prototype.generateTexLexpression = function (index) {
	var numerator = `L_${index}(x) = `, denominator = "";
	for (var j = 0; j < this.quantidadePontos(); j++) {
		if (index != j) {
			numerator += `(x - ${this.xs[j]}) *`;
			denominator += `(${this.xs[index]} - ${this.xs[j]}) *`;
		}
	}

	return `${numerator.substr(0, numerator.length - 1)}/ ${denominator.substr(0, denominator.length - 1)}`;
}

Lagrange.prototype.generateTexPexpression = function () {
	var expression = "P(x) = ";

	for (var i = 0; i < this.quantidadePontos(); i++) {
		expression += `[L_${i}(x) * ${(this.ys[i])}] +`;
	}
	return expression.substr(0, expression.length - 1);
}

$(function () {
	$(document).on("blur", ".number", function () {
		if (!$.isNumeric($(this).html())) {
			$(this).addClass("invalid");
		}
		else {
			$(this).removeClass("invalid");
		}
	});
});

var $TABLE = $('#table');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');
var $CALC = $('#calculate-btn');
var $INTERPOLATE = $('#interpolate-btn');


$('.table-add').click(function () {
	var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line d-none');
	$TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
	$(this).parents('tr').detach();
});

$('.table-up').click(function () {
	var $row = $(this).parents('tr');
	if ($row.index() === 1) return;
	$row.prev().before($row.get(0));
});

$('.table-down').click(function () {
	var $row = $(this).parents('tr');
	$row.next().after($row.get(0));
});

jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.click(function () {
	var $rows = $TABLE.find('tr:not(:hidden)');
	var headers = [];
	var data = [];

	$($rows.shift()).find('th:not(:empty)').each(function () {
		headers.push($(this).text().toLowerCase());
	});

	$rows.each(function () {
		var $td = $(this).find('td');
		var h = {};
		headers.forEach(function (header, i) {
			h[header] = $td.eq(i).text();
		});
		data.push(h);
	});

	$EXPORT.text(JSON.stringify(data));
});

function renderizarExpressao(la) {
	baseLparagraphId = "equationL";

	for (var index = 0; index < la.quantidadePontos(); index++) {
		$("#divEquationL").append(`<p id="${baseLparagraphId + index}">`);
	}

	for (var index = 0; index < la.quantidadePontos(); index++) {
		katex.render(la.generateTexLexpression(index), document.getElementById(baseLparagraphId + index), {
			throwOnError: false
		});
	}

	console.log(la.generateTexPexpression())

	katex.render(la.generateTexPexpression(), equationP, {
		throwOnError: false
	});
}

$('#clear-btn').click(clear);

function clear() {
	$TABLE.find("tr:not(:hidden)").detach();
	clearOutput();
}

function clearOutput() {
	$("#divEquationL").empty();
	$("#equationP").empty();
	$("#divEval").hide();
	$('#resultAlert').hide();
	$("#value").val(0);
}

$CALC.click(function () {
	clearOutput();
	var $rows = $TABLE.find('tr:not(:hidden)');
	var xs = [];
	var ys = [];

	$rows.each(function () {
		var $td = $(this).find('td');
		$td.each(function (index) {
			var v = parseFloat($(this).text());
			if (index == 0) {
				xs.push(v);
			}
			else if (index == 1) {
				ys.push(v);
			}
		});

	});

	lagrange = new Lagrange(xs[0], ys[0], xs[1], ys[1]);
	for (var i = 2; i < xs.length; i++) {
		lagrange.adicionarPonto(xs[i], ys[i]);
	}

	renderizarExpressao(lagrange);
	$("#divEval").show();
});

$INTERPOLATE.click(function () {
	let value = parseFloat($("#value").val());
	$('#resultValue').text(lagrange.evaluateExpression(value));
	$('#resultAlert').fadeIn();

	const xValues = lagrange.plotValoresX();

	const dataPoints = xValues.map(function (x) {
		return { 'x': x, 'y': lagrange.evaluateExpression(x) }
	});
})
