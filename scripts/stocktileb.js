
    $(document).ready(function(){
        var contiguousUpdates = 0;
        var refreshPeriod = 60000;
        var myTicker;
        
        $("#setTicker").click(function(){
            $("#ticker").html("mop");
            var ticker = $("#ticker").val();
            myTicker = ticker.trim().toUpperCase();
            getQuoteAsync(ticker,updateQuote,true);
        });
        
        $("#debug").click(function(){
           //update the price and counters
           getQuoteAsync(myTicker,updateQuote,false);           
        });
        
        $("#help").click(function(){
            window.open("http://michael-saunders.com/stocktile/pages/help.html");           
        });
        
        
        function testJQ(){
            document.getElementById("ticker").innerHTML = "mopa";
        }
        
        $(".display").css(
                "font-size",
                String($(this).height() / 3.6) + "px"
        );
        $("#debug").css(
                "font-size",
                String($(this).height() / 11) + "px"
        );
        $(window).on('resize',function(){
            $(".display").css(
                "font-size",
                String($(this).height() / 3.6) + "px"
            );
            $("#debug").css(
                "font-size",
                String($(this).height() / 11) + "px"
            );
        });
        
        $(document).click(function(event){
            contiguousUpdates = 0; 
        });
        
        function nextPriceFetch(){
            getQuoteAsync(myTicker,updateQuote,true);
        }
        
        function startLoadingUX(){
            
        }
        function stopLoadingUX(){
            
        }
        function showSplashPage(){
            $(".display").hide();
            $("#debug").hide(); 
            $(".splash").show();
        }
        function showDisplayPage(){
            $(".splash").hide();
            $(".display").show();
            $("#debug").show();
        }
        
        function updateQuote(price,change,timestamp,normalCycle){
            //document.getElementById("debug2").innerHTML += " updating the quote page";
            
            $("#stockName").html(myTicker);
            $("#price").html(parseFloat(price).toFixed(2));
            $("#change").html(change.substring(0,1) + String(parseFloat(change.substring(1)).toFixed(2)));
            //document.getElementById("debug2").innerHTML += " " + timestamp.substring(5,7) + "/" + timestamp.substring(8,10) + "/" + timestamp.substring(0,4) + " " + timestamp.substring(11,16) + ":00 UTC";
            var myTime = new Date(timestamp.substring(5,7) + "/" + timestamp.substring(8,10) + "/" + timestamp.substring(0,4) + " " + timestamp.substring(11,16) + ":00 UTC");
            var ampm = "AM";
            var myHours = myTime.getHours();
            var myMinutes = myTime.getMinutes();
            if(myHours > 12){
                ampm = "PM";
                if(myHours == 24){
                    ampm = "AM";
                }
                myHours -= 12;
                //myTime.setHours(myHours);
            }
            else if(myHours == 12){
                ampm = "PM";
            }
            if(myMinutes < 10){
                myMinutes = "0" + myMinutes;
            }
            $("#debug").html(parseInt(myHours,10) + ":" + myMinutes + " " + ampm);
            
            contiguousUpdates++;
            if(change.indexOf("-") > -1){
                $(".display").css("background-color","rgb(166,22,22)");
                $("body").css("background-color","rgb(166,22,22)");
            }
            else{
                $(".display").css("background-color","rgb(27,119,38)");
                $("body").css("background-color","rgb(27,119,38)");
            }
            //document.getElementById("debug2").innerHTML += " will show display page";
            showDisplayPage();            
            
            if(normalCycle){
                //document.getElementById("debug2").innerHTML += " normal cycle timeout";
                if(contiguousUpdates >= 5){
                refreshPeriod = 900000;    // 15 minutes
                }
                else{
                    refreshPeriod = 60000; // 1 minute
                }
                
                setTimeout(function(){
                    nextPriceFetch();
                },refreshPeriod);
            }
            
        }
        
        function getQuoteAsync(ticker,callback,normalCycle){
            startLoadingUX();
            var myUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20%3D%20%22";
            myUrl += ticker.trim() + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
            $.getJSON(myUrl, function(data){
                //document.getElementById("debug2").innerHTML += " got json";
                stopLoadingUX();
                //document.getElementById("debug2").innerHTML += " " + data.query.created;
                var price = data.query.results.quote.LastTradePriceOnly;
                if(price && price != "0.00"){
                    callback(price, data.query.results.quote.Change, data.query.created,normalCycle);
                }
                //else don't callback
                // last, change, timestamp, whether to keep updating regularly
            });
        }
        
        

            showSplashPage();

    });

