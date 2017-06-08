import React, { Component } from 'react';
import { FormGroup, FormControl, Button, Image, Col } from 'react-bootstrap';

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweet_info: null,
      handle: "",
      loading: false,
      error: null,
      mobile: true
    }
  }

  componentWillMount() {
    if (window.matchMedia) {
      var mq = window.matchMedia("(min-width: 760px)");
      mq.addListener(this.watchMedia.bind(this));
      this.watchMedia(mq);
    }
  }

  watchMedia(mq) {
    var mobile;

    if (mq.matches) {
      mobile = false;
    } else {
      mobile = true;
    }

    this.setState({mobile: mobile});
  }

  // This gave me a good laugh.
  handleHandle(e) {
    this.setState({handle: e.target.value});
  }

  submitHandle(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.setProfile();
    }
  }

  setProfile() {
    if (this.state.handle.length > 0) {
      console.log('set profile called');
      this.setState({loading: true});
      const port = window.location.host === 'localhost' ? ':3000' : '';
      const endpoint = window.location.origin.concat(port).concat(`/api/${this.state.handle}`);
      fetch(endpoint)
        .then((response) => {
          if (response.status === 200) {
            return response.json()
          } else {
            throw response;
          }
        }) // Transform the data into json
        .then((data) => {
          this.setState({tweet_info: data, loading: false});
        })
        .catch((err) => {
          this.setState({error: err});
        });
    }
  }

  format(x) {
    if (x % 1 === 0) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return x.toFixed(2).toString();
    }
  }

  getNiceTwitterImage(url) {
    let offset = 10;
    let file_type = '.jpg';

    let type = url.slice(url.length-4);
    if (type === 'jpeg') {
      offset = 11;
      file_type = '.jpeg';
    }

    return url.slice(0,url.length-offset).concat(`200x200${file_type}`);
  }

  componentDidUpdate() {
    window.twttr.widgets.load();
  }

  daysActive(join) {
    var oneDay = 24*60*60*1000;
    var firstDate = new Date(join);
    var secondDate = new Date();

    var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    return diffDays;
  }

  getSlider() {
    let s = this.state.tweet_info.sentiment;

    if (s > 0) {
      s = Math.min(s, .25);
    } else {
      s = Math.max(s, -.25);
    }

    var style = {};
    if (s < -.1) {
      style.backgroundColor = "#c23b22";
    } else if (s < .1) {
      style.backgroundColor = "orange";
    } else {
      style.backgroundColor = "green";
    }

    if (s < 0) {
      style.marginRight = "50%";
      style.marginLeft = ((.25+s)*200).toString().concat("%");
      style.borderBottomLeftRadius = "20px";
      style.borderTopLeftRadius = "20px";
    } else {
      style.marginRight = ((.25-s)*200).toString().concat("%");
      style.marginLeft = "50%";
      style.borderBottomRightRadius = "20px";
      style.borderTopRightRadius = "20px";
    }

    return style;
  }

  render() {
    var profile, profile_image, join_date, summary_data, desktop_summary_data, tweet_info;
    if (this.state.tweet_info) {
      profile = this.state.tweet_info.user;
      tweet_info = this.state.tweet_info;
      profile_image = this.getNiceTwitterImage(profile.profile_image_url);
      join_date = new Date(profile.created_at);
      join_date = monthNames[join_date.getMonth()].concat(' ').concat(join_date.getFullYear());
      summary_data = [
        {metric: "Tweets", value: this.format(profile.statuses_count)},
        {metric: "Followers", value: this.format(profile.followers_count)},
        {metric: "Following", value: this.format(profile.friends_count)},
        {metric: "Favorites", value: this.format(tweet_info.favorites)},
        {metric: "Retweets", value: this.format(tweet_info.retweets)}
      ];
      desktop_summary_data = [
        {metric: "Follower Ratio", value: this.format(profile.followers_count / profile.friends_count)},
        {metric: "Avg. Favorites", value: this.format(tweet_info.favorites / tweet_info.tweets_processed)},
        {metric: "Avg. Retweets", value: this.format(tweet_info.retweets / tweet_info.tweets_processed)},
        {metric: "Daily Posts", value: this.format(profile.statuses_count / this.daysActive(profile.created_at))}
      ];
    }

    return (
      <div className="flex-wrap">
        {
          this.state.tweet_info &&
          <div className="profile-header">
            <div className="profile-back" onClick={() => this.setState({tweet_info: null, handle: ""})}>
              <span className="fa fa-chevron-left" />
              Back
            </div>
          </div>
        }
        <div style={{paddingBottom: "5px"}} />
        {
          this.state.tweet_info === null ?
          <div className="handle-search">
            {
              this.state.loading !== true ?
              <div>
                <div className="header">
                  <span className="fa fa-twitter fa-2x" />
                  <p>Twitter Handle</p>
                </div>
                <FormGroup controlId={"twitter-handle"} style={{marginBottom: "5px"}}>
                  <FormControl type="text"
                    onKeyDown={this.submitHandle.bind(this)}
                    onChange={this.handleHandle.bind(this)}
                    value={this.state.handle}
                  />
                </FormGroup>
                <Button bsStyle="primary" className="center-block"
                  onClick={() => this.setProfile()}>
                  Analyze
                </Button>
              </div>
              :
              <div className="loader-screen">
                <div className="loader center-block" />
                <p style={{width: "250px", textAlign: "center", paddingTop: "15px"}}>
                  Loading tweets...<br/>
                  This may take a minute.
                </p>
              </div>
            }
          </div>
          :
          <div className="info-wrap">
            <div className="handle-info">
              <Image src={profile_image} />
              <div className="user-info">
                <p style={{fontSize: "18px"}}>
                  {profile.name}{' '}
                  {
                    profile.verified &&
                    <span className="fa fa-check-circle" />
                  }
                </p>
                <p style={{fontSize: "12px"}}>
                  @{profile.screen_name}
                </p>
                <div style={{flex: "1"}} />
                {
                  profile.location &&
                  <p>
                    <span className="fa fa-map-marker" />
                    {profile.location}
                  </p>
                }
                <p>
                  <span className="fa fa-calendar" />
                  Joined {join_date}
                </p>
              </div>
            </div>
            <div className="divider" />
            <div className="tweet-info">
              <h4>
                Summary
              </h4>
              {
                this.state.mobile ?
                summary_data.map((metric, i) =>
                  <div key={i}>
                    <Col md={4} xs={4}>
                      {metric.metric}
                    </Col>
                    <Col md={8} xs={8}>
                      {metric.value}
                    </Col>
                  </div>
                )
                :
                <div className="desktop-summary">
                  <div style={{width: "100%"}}>
                    {
                      summary_data.map((metric, i) =>
                        <div key={i}>
                          <Col md={4} xs={4}>
                            {metric.metric}
                          </Col>
                          <Col md={8} xs={8}>
                            {metric.value}
                          </Col>
                        </div>
                      )
                    }
                  </div>
                  <div style={{width: "100%"}}>
                    {
                      desktop_summary_data.map((metric, i) =>
                        <div key={i}>
                          <Col md={7} xs={7}>
                            {metric.metric}
                          </Col>
                          <Col md={5} xs={5}>
                            {metric.value}
                          </Col>
                        </div>
                      )
                    }
                  </div>
                </div>
              }
              <h4>
                Most Popular Tweet
              </h4>
              <blockquote className="twitter-tweet" data-cards="hidden" data-lang="en">
                <a href={`https://twitter.com/${this.state.handle}/status/${tweet_info.popular_tweet_id}`}>
                  {''}
                </a>
              </blockquote>
              <h4>
                Tweet Sentiment
              </h4>
              <div className="sentiment">
                <div className="slider-tick">
                  <div>Negative</div>
                  <div>Neutral</div>
                  <div>Positive</div>
                </div>
                <div className="sentiment-slider">
                  <div className="sentiment-slider-comp" style={this.getSlider()}/>
                </div>
                <p style={{textAlign: "center"}}>
                  <strong>Sentiment Score: {(tweet_info.sentiment*100).toFixed()}</strong>
                </p>
                <p style={{textAlign: "center", fontSize: "8px"}}>
                  <i>
                    Score is based off only your authored tweets. Score is determined
                    by npm module sentiment and is averaged over your tweets.
                  </i>
                </p>
              </div>
              <p style={{textAlign: "center", paddingBottom: "5px"}}>
                 Based off last {tweet_info.tweets_processed} tweets.
              </p>
            </div>
          </div>
        }
        <div style={{paddingBottom: "5px"}} />
        <div className="footer">
          <span className="fa fa-github fa-2x" onClick={() => window.location.href = "https://github.com/cdvallejo/"} />
          <p>&copy; 2017 Cristian Vallejo</p>
        </div>
      </div>
    );
  }
}

export default App;
