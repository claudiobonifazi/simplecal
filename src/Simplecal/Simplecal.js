import React from "react";
import "./Simplecal.css";
import "./Theme_1.css";

class Simplecal extends React.Component {

	static defaultProps = {
		defaultValue: null,
		min: null,
		max: null,
		disabled: false,
		description: "",
		onChange: null,
		onMonthChange: null
	};

	state = {
		selected: null,
		visualized: null,
		monthSelOpened: false,
		monthSelYearRange: null,
		monthSelScrollTo: null,
		error: ""
	};

	static days = [
		{ name: "sunday" },
		{ name: "monday" },
		{ name: "tuesday" },
		{ name: "wednesday" },
		{ name: "thursday" },
		{ name: "friday" },
		{ name: "saturday" },
	];

	static rows = 5;

	static months = [
		{ name: "january" },
		{ name: "february" },
		{ name: "march" },
		{ name: "april" },
		{ name: "may" },
		{ name: "june" },
		{ name: "july" },
		{ name: "august" },
		{ name: "september" },
		{ name: "october" },
		{ name: "november" },
		{ name: "december" },
	];

	container = null;

	constructor(props) {
		super(props);
		this.state.selected = props.defaultValue || null;
		this.state.visualized = props.defaultValue ? new Date(props.defaultValue) : new Date();
		this.state.monthSelYearRange = {
			min: this.state.visualized.getFullYear() - 20,
			max: this.state.visualized.getFullYear() + 20
		};
		this.container = React.createRef();
	}

	_validate() {
		if (!(this.props.defaultValue instanceof Date) && this.props.defaultValue !== null) {
			this.state.error = "defaultValue prop must be Date object or unassigned";
		}
		if (!(this.props.min instanceof Date) && this.props.min !== null) {
			this.state.error = "min prop must be Date object or unassigned";
		}
		if (!(this.props.max instanceof Date) && this.props.max !== null) {
			this.state.error = "max prop must be Date object or unassigned";
		}
		if (typeof this.props.disabled !== 'boolean') {
			this.state.error = "disabled prop must be of type boolean, default false";
		}
		if (typeof this.props.description !== 'string') {
			this.state.error = "description prop must be of type string, default \"\"";
		}
	}

	componentDidMount() {
		this._validate();
	}

	componentDidUpdate() {
		this._validate();
		if (this.state.monthSelOpened) {
			let el = this.container.current;
			if (el) {
				switch (this.state.monthSelScrollTo) {
					case 'top':
						el = el.querySelectorAll('.scal_monthSelList>details')[20];
						break;
					case 'bottom':
						el = el.querySelectorAll('.scal_monthSelList>details');
						el = el[el.length - 21];
						break;
					default:
						el = el.querySelector('.scal_monthSelList>details[open]');
				}
				if (el) {
					el.scrollIntoView();
				};
			}
		}
	}

	render() {
		let html;
		if (this.state.error.length === 0) {
			let contClasses = ["scal_container"];
			if (this.props.disabled) {
				contClasses.push("scal_fullDisabled");
			}
			html = (
				<div className={contClasses.join(' ')} style={this._functionalCss()} ref={this.container}>
					<div className="scal_header">
						<div className="scal_goLeft" title="Show previous month" role="button" tabIndex={0} aria-pressed={false} onClick={this._changeMonth.bind(this, -1)} />
						<div className="scal_title" title="Select a farthest date" role="button" tabIndex={0} aria-pressed={false} onClick={this._toggleMonthSel.bind(this)}>
							{this.state.visualized.toLocaleString('default', { month: 'long' }) + ' ' + this.state.visualized.getFullYear()}
						</div>
						<div className="scal_goRight" title="Show next month" role="button" tabIndex={0} aria-pressed={false} onClick={this._changeMonth.bind(this, 1)} />
					</div>
					{this._bodyHtml()}
				</div>
			);
		} else {
			html = (
				<div className="scal_error">
					<strong style={{ display: "block", fontSize: "150%" }}>
						Component error
					</strong>
					<strong>
						{this.state.error}
					</strong>
				</div>
			);
		}
		return html;
	}


	_daysButtons() {
		let daysButtons = [];

		let start = new Date(
			this.state.visualized.getFullYear(),
			this.state.visualized.getMonth(),
			1, 0, 0, 0, 0);
		while (start.getDay() > 0) {
			start.setDate(start.getDate() - 1);
		}

		let end = new Date(
			this.state.visualized.getFullYear(),
			this.state.visualized.getMonth() + 1,
			0, 23, 59, 59, 0);
		while (end.getDay() < Simplecal.days.length - 1) {
			end.setDate(end.getDate() + 1);
		}

		let count = 0;
		let maxEl = Simplecal.rows * Simplecal.days.length;
		for (let g = start; (this._isPrevDay(g, end) || this._isSameDay(g, end)) && count < maxEl; g.setDate(g.getDate() + 1)) {
			daysButtons.push(new Date(g));
		}
		return daysButtons;
	}

	_bodyHtml() {
		let html;
		if (!this.state.monthSelOpened) {
			html = (<>
				<div className="scal_dayNames">
					{Simplecal.days.map((d, i) => <div key={i}>{d.name.substr(0, 3)}</div>)}
				</div>
				<div className="scal_dayButtons">
					{this._daysButtons().map((d, i) => {
						let cl = ["scal_dayButton"];
						if (this.state.selected && this._isSameDay(d, this.state.selected)) {
							cl.push("scal_daySelected");
						}
						if (this._isPrevMonth(d, this.state.visualized)) {
							cl.push("scal_dayPrevMonth");
						} else {
							if (!this._isSameMonth(d, this.state.visualized)) {
								cl.push("scal_dayNextMonth");
							}
						}
						if (this.props.min && this._isPrevDay(d, this.props.min)) {
							cl.push("scal_dayDisabled");
						}
						if (this.props.max && this._isPrevDay(this.props.max, d)) {
							cl.push("scal_dayDisabled");
						}
						let out;
						if (cl.indexOf("scal_dayDisabled") < 0 && !this.props.disabled) {
							out = <div className={cl.join(' ')} key={i} title={d.toLocaleDateString()} onClick={this._selectDay.bind(this, d)} onKeyPress={this._selectDayEnter.bind(this, d)} role="button" tabIndex={0} aria-pressed={false}>
								{d.getDate()}
							</div>;
						} else {
							out = <div className={cl.join(' ')} key={i}>
								{d.getDate()}
							</div>
						}
						return out;
					})}
				</div>
				{this._footerHtml()}
			</>);
		} else {
			let years = [];
			let tmp = this.state.visualized.getFullYear();
			for (let i = this.state.monthSelYearRange.min; i < this.state.monthSelYearRange.max; i++) {
				years.push(i);
			}
			html = (<>
				<div className="scal_monthSelList" onScroll={this._scrollSelMonth.bind(this)}>
					{years.map((year, i) => {
						return <details key={i} open={this.state.visualized.getFullYear() === year}>
							<summary title={year}>{year}</summary>
							<div className="scal_selMonths">
								{Simplecal.months.map((m, i) =>
									<div key={i} className="scal_selMonthEl" title={m.name} role="button" tabIndex={0} aria-pressed={false} onClick={this._selMonth.bind(this, year, i)}>
										{m.name.substr(0, 3)}
									</div>)
								}
							</div>
						</details>;
					})}
				</div>
			</>);
		}
		return html;
	}

	_footerHtml() {
		let description;
		switch (this.props.description) {
			case '{value}':
				description = Simplecal.days[this.state.selected.getDay()].name
					+ ' '
					+ this.state.selected.toISOString().split('T')[0];
				break;
			case '{input}':
				if (this.state.selected) {
					description = <input type="date" title="Selected day"
						style={{ color: "var(--scal-selbg)" }}
						defaultValue={this.state.selected.toISOString().split('T')[0]}
						onInput={this._selectDay.bind(this)} />;
				} else {
					description = <input type="text" placeholder="Select a day"
						onFocus={(e => { e.currentTarget.type = 'date' }).bind(this)}
						onBlur={(e => { if (!e.currentTarget.value) { e.currentTarget.type = 'text' } }).bind(this)} />;
				}
				break;
			default:
				description = this.props.description;
		}
		return <div className="scal_footer">
			<div className="scal_description">
				{description}
			</div>
			{!this._isSameDay(this.state.visualized, new Date()) ?
				<div className="scal_todayBtn" title="Show current month" role="button" tabIndex={0} aria-pressed={false} onClick={this.visualizeToday.bind(this)} >Today</div>
				:
				<div className="scal_todayBtn scal_todayDisabled">Today</div>
			}
		</div>;
	}

	_functionalCss() {
		return {
			'--scal-weekdaynum': Simplecal.days.length,
			'--scal-rowsnum': Simplecal.rows,
		};
	}

	_isSameDay(d1, d2) {
		d2 = d2 || new Date();
		return d1.getFullYear() === d2.getFullYear()
			&& d1.getMonth() === d2.getMonth()
			&& d1.getDate() === d2.getDate();
	}

	_isPrevDay(d1, d2) {
		d2 = d2 || new Date();
		let k1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
		let k2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
		return k1 < k2;
	}

	_isSameMonth(d1, d2) {
		d2 = d2 || new Date();
		return d1.getFullYear() === d2.getFullYear()
			&& d1.getMonth() === d2.getMonth();
	}

	_isPrevMonth(d1, d2) {
		d2 = d2 || new Date();
		let k1 = new Date(d1.getFullYear(), d1.getMonth(), 1);
		let k2 = new Date(d2.getFullYear(), d2.getMonth(), 1);
		return k1 < k2;
	}

	_changeMonth(step) {
		let newDate = this.state.visualized;
		newDate.setMonth(parseInt(newDate.getMonth()) + step);
		this.setState({
			visualized: newDate
		}, () => {
			if (typeof this.props.onMonthChange === 'function') {
				this.props.onMonthChange.apply(this, [newDate]);
			}
		});
	}

	_selectDay(d) {
		if (!(d instanceof Date)) {
			d = new Date(d.currentTarget.value);
		}
		if (!isNaN(d)) {
			if (!this.props.disabled) {
				if (!d || !this.props.min || !this._isPrevDay(d, this.props.min)) {
					if (!d || !this.props.max || this._isPrevDay(d, this.props.max)) {
						this.setState({
							selected: d
						}, () => {
							if (typeof this.props.onChange === 'function') {
								this.props.onChange.apply(this, [d]);
							}
						});
					}
				}
			}
		}
	}

	_selectDayEnter(d, e) {
		if (e.which === 13) {
			if (!this.props.disabled) {
				this._selectDay(d);
			}
		}
	}

	_toggleMonthSel() {
		this.setState({
			monthSelOpened: !this.state.monthSelOpened,
			monthSelYearRange: {
				min: this.state.visualized.getFullYear() - 20,
				max: this.state.visualized.getFullYear() + 20
			}
		});
	}

	_selMonth(year, month) {
		this.setState({
			visualized: new Date(year, month, 15),
			monthSelOpened: false,
			monthSelYearRange: {
				min: this.state.visualized.getFullYear() - 20,
				max: this.state.visualized.getFullYear() + 20
			}
		});
	}

	_scrollSelMonth(e) {
		let threshold = 100;
		if (e.currentTarget.scrollTop < threshold) {
			let tmp = this.state.monthSelYearRange;
			tmp.min -= 20;
			this.setState({
				monthSelYearRange: tmp,
				monthSelScrollTo: 'top'
			})
		}
		if (e.currentTarget.scrollTop >= e.currentTarget.scrollHeight - 3 * threshold) {
			let tmp = this.state.monthSelYearRange;
			tmp.max += 20;
			this.setState({
				monthSelYearRange: tmp,
				monthSelScrollTo: 'bottom'
			})
		}
	}

	set value(d) {
		return this._selectDay(d);
	}

	get value() {
		return this.state.selected;
	}

	toString() {
		return this.state.selected.toISOString().split('T')[0];
	}

	empty() {
		return this._selectDay(null);
	}

	reset() {
		this.setState({
			selected: this.props.defaultValue || null,
			visualized: this.props.defaultValue ? new Date(this.props.defaultValue) : new Date()
		}, () => {
			if (typeof this.props.onChange === 'function') {
				this.props.onChange.apply(this, [this.props.defaultValue || null]);
			}
			if (typeof this.props.onMonthChange === 'function') {
				this.props.onMonthChange.apply(this, [this.props.defaultValue ? new Date(this.props.defaultValue) : new Date()]);
			}
		});
	}

	visualizeToday() {
		let v = new Date();
		this.setState({
			visualized: v
		}, () => {
			if (typeof this.props.onMonthChange === 'function') {
				this.props.onMonthChange.apply(this, [v]);
			}
		});
	}


}

export default Simplecal;
