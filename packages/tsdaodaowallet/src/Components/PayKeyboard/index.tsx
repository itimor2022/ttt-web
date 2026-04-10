import React, { Component } from "react";
import "./index.css";

interface PayKeyboardProps {
    // 模式1: 受控组件模式
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    maxLength?: number;
    // 模式2: 回调模式
    onInput?: (key: string) => void;
    // 通用
    disabled?: boolean;
}

interface PayKeyboardState {
    pressedKey: string | null;
}

export default class PayKeyboard extends Component<PayKeyboardProps, PayKeyboardState> {
    constructor(props: PayKeyboardProps) {
        super(props);
        this.state = {
            pressedKey: null,
        };
    }

    handleKeyPress = (key: string) => {
        const { value = "", onChange, onComplete, onInput, maxLength = 6, disabled } = this.props;
        
        if (disabled) return;

        // 模式2: 回调模式
        if (onInput) {
            onInput(key);
            return;
        }

        // 模式1: 受控组件模式
        if (onChange) {
            if (key === "delete") {
                onChange(value.slice(0, -1));
            } else if (key === "clear") {
                onChange("");
            } else if (/^\d$/.test(key)) {
                if (value.length < maxLength) {
                    const newValue = value + key;
                    onChange(newValue);
                    
                    if (newValue.length === maxLength && onComplete) {
                        onComplete(newValue);
                    }
                }
            }
        }
    };

    handleKeyDown = (key: string) => {
        this.setState({ pressedKey: key });
    };

    handleKeyUp = () => {
        this.setState({ pressedKey: null });
    };

    renderKey(key: string, label?: React.ReactNode, className?: string) {
        const { pressedKey } = this.state;
        const { disabled } = this.props;
        
        return (
            <button
                key={key}
                className={`wk-pay-key ${className || ""} ${pressedKey === key ? "pressed" : ""} ${disabled ? "disabled" : ""}`}
                onMouseDown={() => this.handleKeyDown(key)}
                onMouseUp={this.handleKeyUp}
                onMouseLeave={this.handleKeyUp}
                onTouchStart={() => this.handleKeyDown(key)}
                onTouchEnd={this.handleKeyUp}
                onClick={() => this.handleKeyPress(key)}
                disabled={disabled}
            >
                {label || key}
            </button>
        );
    }

    render() {
        return (
            <div className="wk-pay-keyboard">
                <div className="wk-pay-keyboard-row">
                    {this.renderKey("1")}
                    {this.renderKey("2")}
                    {this.renderKey("3")}
                </div>
                <div className="wk-pay-keyboard-row">
                    {this.renderKey("4")}
                    {this.renderKey("5")}
                    {this.renderKey("6")}
                </div>
                <div className="wk-pay-keyboard-row">
                    {this.renderKey("7")}
                    {this.renderKey("8")}
                    {this.renderKey("9")}
                </div>
                <div className="wk-pay-keyboard-row">
                    {this.renderKey("clear", 
                        <span className="wk-pay-key-text">清空</span>,
                        "wk-pay-key-action"
                    )}
                    {this.renderKey("0")}
                    {this.renderKey("delete", 
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M21 6H8L2 12L8 18H21C21.55 18 22 17.55 22 17V7C22 6.45 21.55 6 21 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 9L12 15M12 9L18 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>,
                        "wk-pay-key-action"
                    )}
                </div>
            </div>
        );
    }
}
