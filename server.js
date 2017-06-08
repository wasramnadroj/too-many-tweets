const express = require("express");
const path = require('path');
const body_parser = require("body-parser");
const NodeCache = require( "node-cache" );
const api_cache = new NodeCache( { stdTTL: 86400000 } );

if (process.env.NODE_ENV === "development") {
  console.log('Load development environment variables');
  require('dotenv').load();
}

let app = express();

app.use(body_parser.json({limit: '4096mb'}));
app.use(body_parser.urlencoded({extended: true, limit: '4096mb'}));

var Twitter = require('twitter');
var sentiment = require('sentiment');

var client = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

function fetchUserTweets(tweet_fetch, callback) {
  let tweet_info = {
    tweets_processed: 0,
    favorites: 0,
    retweets: 0,
    popular_tweet_id: 0,
    hashtags: {},
    max_interaction: 0,
    sentiment: 0
  };

  function report(tweet_count, max_id) {
    if(tweet_count === 0) {
      tweet_info.sentiment /= tweet_info.tweets_processed;
      tweet_info.sentiment = tweet_info.sentiment.toFixed(2);
      callback(tweet_info);
    } else {
      tweet_fetch(tweet_info, max_id, report);
    }
  }

  tweet_fetch(tweet_info, undefined, report);
}

app.get('/api/:handle', (req, res) => {
  var result;

  let cached_profile = api_cache.get(req.params.handle);
  if (cached_profile !== undefined) {
    cached_profile.cached = true;
    res.status(200).json(cached_profile);
    return;
  }

  fetchUserTweets((tweet_info, max_id, report) => {
    let options = {
      screen_name: req.params.handle,
      count: 200,
      include_rts: false
    };

    if ( max_id !== undefined ) {
      options.max_id = max_id;
    }

    client.get('statuses/user_timeline', options, (error, tweets, response) => {
      var total_interaction, tweet;
      if (!error && tweets.length > 1) {

        if ( tweet_info.user === undefined ) {
          tweet_info.user = tweets[0].user;
        }

        let max = tweets[0].id;
        for (var i = 0; i < tweets.length; i++) {
          tweet = tweets[i];

          tweet_info.favorites += tweet.favorite_count;
          tweet_info.retweets += tweet.retweet_count;
          tweet_info.sentiment += sentiment(tweet.text).comparative;

          total_interaction = tweet.favorite_count + tweet.retweet_count;
          if (total_interaction > tweet_info.max_interaction) {
            tweet_info.max_interaction = total_interaction;
            tweet_info.popular_tweet_id = tweet.id_str;
          }

          tweet_info.tweets_processed += 1;

          if (tweet.id < max) {
            max = tweet.id;
          }
        }

        report(tweets.length, max);
      } else {
        if (error) {
          res.sendStatus(500);
          return;
        }
        report(0, 0);
      }
    });

  }, (tweet_info) => {
    tweet_info.cached = false;
    api_cache.set(req.params.handle, tweet_info);
    res.status(200).json(tweet_info);
  });
});

if (process.env.NODE_ENV === "production" || true) {
  // Initialize the app.
  var server = app.listen(process.env.PORT || 8540, function () {
    var port = server.address().port;
    console.log("Now hosting on port:", port);
  });

  // Serve Content
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
