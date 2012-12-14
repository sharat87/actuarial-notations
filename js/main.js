jQuery(function ($) {

    var policyDescElem = $('#policy-desc'),
        policyDescTemplate = _.template($('#policy-desc-template').html()),
        policyForm = $('#policy-form'),
        displayElem = $('#notation-display'),
        issueAgeInput = $('#issue-age'),
        selectPeriodInput = $('#select-period'),
        assuranceCheck = $('#is-assurance'),
        endowmentCheck = $('#is-endowment'),
        termInput = $('#term-input'),
        annuityCheck = $('#is-annuity'),
        deferInput = $('#defer-input');

    // Set the given display to the math in the given TeX string.
    var setMath = function (tex) {
        setTimeout(function () {
            var math = MathJax.Hub.getAllJax('notation-display')[0];
            MathJax.Hub.Queue(['Text', math, tex]);
        }, 10);
    };

    var describePolicy = function () {
        var policy = {
            issueAge: parseInt(issueAgeInput.val(), 10),
            selectPeriod: parseInt(selectPeriodInput.val(), 10),
            isAssurance: assuranceCheck.is(':checked'),
            isEndowment: endowmentCheck.is(':checked'),
            isAnnual: annuityCheck.is(':checked'),
            term: parseInt(termInput.val(), 10),
            defer: parseInt(deferInput.val(), 10),
            timing: policyForm
                .find('input:radio[name=timing-input]:checked').val()
        };

        displayPolicyDesc(policy);
        displayEPV(policy);
    };

    var displayPolicyDesc = function (policy) {
        policyDescElem.html(policyDescTemplate(policy));
    };

    var displayEPV = function (policy) {

        var math = ['EPV ='];

        if (policy.defer) {
            math.push('_{' + policy.defer + '|}');
        }

        var center = policy.isAnnual ? 'a' : 'A';
        if (policy.timing === 'immediate') {
            center = '\\bar {' + center + '}';
        }
        math.push(center);

        var subscript = '';

        if (isNaN(policy.selectPeriod)) {
            subscript = policy.issueAge;
        } else {
            subscript = '[' + policy.issueAge + ']';
            if (policy.selectPeriod != 0) {
                subscript += '+' + policy.selectPeriod;
            }
        }

        if (policy.term) {
            subscript += ':' + '\\enclose {actuarial} {' + policy.term + '}';
        }

        math.push('_{' + subscript + '}');

        if (policy.isAssurance && !policy.isEndowment) {
            if (policy.issueAge > 9) {
                math.push('^ {\\space 1}');
            } else {
                math.push('^1');
            }
        } else if (policy.isEndowment && !policy.isAssurance) {
            // Silly hack to make the `1` super script to line up with second
            // status variable in subscript.
            math.push('^ {' +
                      policy.issueAge.replace(/./g, '\\space \\space ') +
                      '\\space \\space 1}');
        }

        setMath(math.join(' '));
    };

    policyForm.on({

        submit: function (e) {
            e.preventDefault();
            describePolicy();
        },

        change: function (e) {
            var id = e.target.id || e.target.name;

            switch (id) {
                case 'is-endowment':
                    termInput.required = endowmentCheck.checked;
                    break;
            }
        }

    });

    $('#about-btn').click(function (e) {
        e.preventDefault();
        $('#about-box').parent().show();
    });

    $('.mask').click('click', function (e) {
        if (e.target === e.currentTarget) {
            $(this).hide();
        }
    });

    setTimeout(describePolicy, 1000);

});
