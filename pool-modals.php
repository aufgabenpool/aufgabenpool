
<div class="modal" id="modal-bug-reporting" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <!--<form action="services/login.php" method="post">-->
                <div class="modal-header">
                    <h5 class="modal-title">
                        Meldung eines Fehlers zur Aufgabe<br/>
                        &raquo;
                            <span id="modal-bug-reporting-title"></span>
                        &laquo;
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p><b>Fehlertyp auswählen:</b></p>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="bug-type" id="bugreport1" checked>
                        <label class="form-check-label" for="bugreport1">
                            Inhaltlicher Fehler
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="bug-type" id="bugreport2">
                        <label class="form-check-label" for="bugreport2">
                            Fehler beim Import in Moodle
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="bug-type" id="bugreport3">
                        <label class="form-check-label" for="bugreport3">
                            Fehler beim Import in Ilias
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="bug-type" id="bugreport3">
                        <label class="form-check-label" for="bugreport3">
                            Sonstiger Fehler
                        </label>
                    </div>
                    <hr/>
                    <p><b>Fehlerbeschreibung:</b></p>
                    <textarea class="form-control" id="bugreport-text" rows="5"></textarea>
                    <hr/>
                    <p><b>Kontaktdaten (optional):</b></p>
                    <textarea class="form-control" id="bugreport-contact" rows="2"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                    <button type="submit" class="btn btn-success" onclick="aufgabenpool.reportBug();">Senden</button>
                </div>
            <!--</form>-->
        </div>
    </div>
</div>
