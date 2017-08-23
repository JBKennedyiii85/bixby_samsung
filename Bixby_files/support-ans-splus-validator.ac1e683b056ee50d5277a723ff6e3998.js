$(document).on("foundation-contentloaded", function(e) {
    if ((window.location.href.indexOf("/content/samsung/samsung-plus/answer/") > -1) || ((window.location.href.indexOf("/content/samsung/us/support/answer/") > -1))) {
        $('#answer-mapping').removeAttr('disabled');
    }

});

$(document).on('click', '.pageinfo-editproperties', function() {
    $(document).on("foundation-contentloaded", function(e) {
        $(".cq-splustab-showhide").each(function() {
            showHide($(this));
            $(".cq-dialog-splusradio-showhide").each(function() {
                showRewardField($(this));
            });
        })
    })
    $(document).on("change", ".cq-dialog-splusradio-showhide", function(e) {
        showRewardField($(this));
    });

 });
function showHide(el){
		var ansType = $('#ansType').val();
    	if (!(ansType == 'SK' || ansType == 'TI' || ansType == 'AT' || ansType == 'V')){
            var target = el.data("cq-splustab-showhide");
            var value = ansType ? el.val() : '';
            $(target).not(".hide").addClass("hide");
            $('#propertiesContainer').hide();           
        }


}

function showRewardField(el) {
    var checked = el.prop('checked');
    var value = checked ? el.val() : '';
    if (value == 'rewardUrl') {
        $("#youtubeContainer").hide();
        $("#videoContainer").hide();
        $("#rewardContainer").show();
        $("#youTubeCode").removeAttr('value');
    }
    if (value == 'youTubeID') {
        $("#rewardContainer").hide();
        $("#videoContainer").hide();
        $("#youtubeContainer").show();
        $("#rewardUrl").removeAttr('value');
        $("#rewardAndroidUrl").removeAttr('value');

    }
    if (value == 'rewardFile') {
        $("#rewardContainer").hide();
        $("#youtubeContainer").hide();
        $("#videoContainer").show();
        $("#youTubeCode").removeAttr('value');
        $("#rewardUrl").removeAttr('value');
        $("#rewardAndroidUrl").removeAttr('value');


    }



}
