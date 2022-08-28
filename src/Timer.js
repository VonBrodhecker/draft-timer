import React from 'react';
import './Timer.css';
import expired from './boatairhorn.wav'
import next from './boxingbell.mp3'
import Sound from 'react-sound'

const defaultDraftTime = 10
const startingPoint = 3
const direction = 'backward'
const draftList = [
    { name: 'Brian', penalty: 0 },
    { name: 'Scis', penalty: 0 },
    { name: 'Dan', penalty: 0 },
    { name: 'Matt', penalty: 0 }
]
export class Timer extends React.Component {
    constructor(props) {
        super(props)
        this.state = { time: {}, seconds: defaultDraftTime, mode: 'handoff', draftIndex: startingPoint };
        this.timer = 0
        this.direction = direction
        this.draftTime = defaultDraftTime
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
        this.handleSnakePick = this.handleSnakePick.bind(this)
        this.goBackward = this.goBackward.bind(this)
        this.goForward = this.goForward.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleSongFinishedPlaying = this.handleSongFinishedPlaying.bind(this)
        this.snakePicks = 0
        this.paused = false
        this.next = false
    }

    componentDidMount() {
        this.startTimer()
        document.addEventListener("keydown", this.handleKeyPress);
    }

    startTimer() {
        if (this.timer == 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    getDraftee(index) {
        if (index !== undefined) {
            return draftList[index]
        } else {
            return draftList[this.state.draftIndex]
        }
    }

    timerExpired() {
        this.expired = true
        this.getDraftee().penalty++
        this.onToTheNextOne()
    }

    goForward() {
        this.resetTimer(this.state.draftIndex + 1)
        this.setState({ draftIndex: this.state.draftIndex + 1 })
    }

    goBackward() {
        this.resetTimer(this.state.draftIndex - 1)
        this.setState({ draftIndex: this.state.draftIndex - 1 })

    }

    handleSnakePick(nextPick) {
        if (this.snakePicks === 1) {
            this.snakePicks = 0
            this.direction = this.direction === 'forward' ? 'backward' : 'forward'
            nextPick(true)
        } else {
            this.resetTimer(this.state.draftIndex)
            this.snakePicks = 1
        }
    }

    onToTheNextOne() {
        this.next = true
        const length = draftList.length
        if (this.direction === 'forward') {
            if (this.state.draftIndex === length - 1) {
                this.handleSnakePick(this.goBackward)
            } else {
                this.goForward()
            }
        } else if (this.direction === 'backward') {
            if (this.state.draftIndex === 0) {
                this.handleSnakePick(this.goForward)
            } else {
                this.goBackward()
            }
        }

    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        if (this.paused) {
            return
        }


        let seconds = this.state.seconds - 1;
        this.setState({
            // time: this.secondsToTime(seconds),
            seconds: seconds,
        });

        if (seconds < 10) {
            this.setState({ mode: 'final' })
        } else if (seconds < 30) {
            this.setState({ mode: 'almost' })
        } else if (seconds < 60) {
            this.setState({ mode: 'warning' })
        } 
        
        // Check if we're at zero.
        if (seconds == 0) {
            this.timerExpired()
        }
    }

    resetTimer(index) {
        // get the penalties
        console.log(this.getDraftee(index).name)
        const penalties = this.getDraftee(index).penalty
        let time = defaultDraftTime
        for (let i = 0; i < penalties; i++) {
            time = Math.ceil(time / 2)
        }

        let mode = ''
        if (time < 10) {
            mode = 'final'
        } else if (time < 30) {
            mode = 'almost'
        } else if (time < 60) {
            mode = 'warning'
        } 
        this.setState({ seconds: time, mode: mode })
    }

    nextPick() {
        this.getDraftee().penalty = 0
        this.onToTheNextOne()
    }

    handleKeyPress(event) {
        if (event.code === 'Space') {
            this.paused = !this.paused
            if (this.paused) {
                this.setState({ mode: 'paused' })
            }
        }
    }

    handleSongFinishedPlaying() {
        this.expired = false
        this.next = false
    }

    str_pad_left(string, length = 2) {
        return (new Array(length + 1).join(0) + string).slice(-length);
    }

    render() {

        const time = this.state.seconds
        const minutes = this.str_pad_left(Math.floor(time / 60), 1)
        const seconds = this.str_pad_left(time - minutes * 60)
        return (
            <div className={['Timer', this.state.mode].join(' ')} onKeyPress={(e) => this.handleKeyPress(e)} onClick={() => this.nextPick()}>
                <div className={'Name'}>{draftList[this.state.draftIndex].name}</div>
                <div className={'Time'}>{`${minutes}:${seconds}`}</div>
                {this.expired && <Sound
                    url={expired}
                    playStatus={Sound.status.PLAYING}
                    onLoading={this.handleSongLoading}
                    onPlaying={this.handleSongPlaying}
                    onFinishedPlaying={this.handleSongFinishedPlaying}
                />}
                {this.next && <Sound
                    url={next}
                    playStatus={Sound.status.PLAYING}
                    onLoading={this.handleSongLoading}
                    onPlaying={this.handleSongPlaying}
                    onFinishedPlaying={this.handleSongFinishedPlaying}
                />}
            </div>
        )
    }
}

