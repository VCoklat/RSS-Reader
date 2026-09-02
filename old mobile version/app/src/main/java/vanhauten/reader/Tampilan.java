package vanhauten.reader;

/**
 * Created by vanhauten on 29/02/16.
 */

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ShareActionProvider;

public class Tampilan extends Activity {
        public boolean onCreateOptionsMenu(Menu menu) {

                // Inflate the menu; this adds items to the action bar if it is present.
                getMenuInflater().inflate(R.menu.share, menu);

                MenuItem shareItem = (MenuItem) menu.findItem(R.id.action_share);

                ShareActionProvider mShare;
                mShare = (ShareActionProvider)shareItem.getActionProvider();

                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setAction(Intent.ACTION_SEND);
                shareIntent.setType("text/plain");
                shareIntent.putExtra(Intent.EXTRA_TEXT, "text to share");

                mShare.setShareIntent(shareIntent);

                return true;
        }
    ImageButton imageButton, imageButton1, imageButton2;
@Override
public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.home);

        addListenerOnButton();

        }

public void addListenerOnButton() {

        imageButton = (ImageButton) findViewById(R.id.tahukah);

        imageButton.setOnClickListener(new View.OnClickListener() {

@Override
public void onClick(View arg0) {
        Intent k = new Intent(Tampilan.this, Tahukah_Kamu.class);
        startActivity(k);
        }

        });
        imageButton1 = (ImageButton) findViewById(R.id.itech);

        imageButton1.setOnClickListener(new View.OnClickListener() {

                @Override
                public void onClick(View arg0) {
                        Intent k = new Intent(Tampilan.this, vanhauten.reader.ITech.class);
                        startActivity(k);
                }

        });
    }};