function showToast(message, isDanger = false) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    if (isDanger) {
        toast.className = 'show danger';
    } else {
        toast.className = 'show';
    }
    setTimeout(function () {
        toast.className = toast.className.replace('show', '');
        toast.className = toast.className.replace('danger', '');
    }, 3000);
}
